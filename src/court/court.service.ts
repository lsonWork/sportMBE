/* eslint-disable */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Court } from './entities/court.entity';
import { Between, DataSource, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCourtRequestDto } from './DTO/createCourtRequestDto';
import { User } from 'src/user/entities/user.entity';
import { Role } from 'src/common/enum/Role';
import { SportType } from 'src/sport-type/entities/sportType.entity';
import { Param, ParseUUIDPipe } from '@nestjs/common';
import { Body, Request } from '@nestjs/common';
import { EditCourtDto } from './DTO/editCourtDto';
import { DeleteCourtDto } from './DTO/deleteCourtDto';
import {
  IPaginationOptions,
  paginate,
  Pagination,
} from 'nestjs-typeorm-paginate';
import { haversineDistance } from 'src/utils/haversineDistance';
import { NearByCourt } from './interface/NearByCourt';
import { NearByCourtRaw } from './interface/NearByCourtRaw';
import { CourtImage } from './entities/courtImage.entity';
import { Booking } from 'src/booking/entities/booking.entity';
import { BookingStatus } from 'src/common/enum/BookingStatus';
import { TimeSlot } from './interface/TimeSlots';
import { PaymentStatus } from 'src/common/enum/PaymentStatus';
import { BookingOrder } from 'src/booking/entities/booking-order.entity';
import { Payment } from 'src/payment/entities/payment.entity';
import { DashboardRequestDTO } from './DTO/DashbroadRequestDTO';

@Injectable()
export class CourtService {
  constructor(
    @InjectRepository(Court)
    private courtRepository: Repository<Court>,
    @InjectRepository(SportType)
    private sportTypeRepository: Repository<SportType>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(CourtImage)
    private courtImageRepository: Repository<CourtImage>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(BookingOrder)
    private bookingOrderRepository: Repository<BookingOrder>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private dataSource: DataSource,
  ) {}

  async createCourt(
    createCourtDto: CreateCourtRequestDto,
    ownerId: string,
  ): Promise<Court> {
    const owner = await this.userRepository.findOneBy({ userId: ownerId });
    if (!owner) {
      throw new HttpException(
        { message: 'Chủ sở hữu không tồn tại' },
        HttpStatus.NOT_FOUND,
      );
    }
    if (owner.role !== Role.OWNER) {
      throw new HttpException(
        { message: 'Chỉ chủ sở hữu mới có thể tạo sân' },
        HttpStatus.FORBIDDEN,
      );
    }
    const sportType = await this.sportTypeRepository.findOneBy({
      sportTypeId: createCourtDto.sportType,
    });
    if (!sportType) {
      throw new HttpException(
        {
          message: `Không tìm thấy loại thể thao có id = "${createCourtDto.sportType}"`,
        },
        HttpStatus.NOT_FOUND,
      );
    }
    const existingCourt = await this.courtRepository.findOneBy({
      courtName: createCourtDto.name,
      owner: { userId: ownerId },
    });
    if (existingCourt) {
      throw new HttpException(
        { message: 'Đã tồn tại sân có tên này' },
        HttpStatus.CONFLICT,
      );
    }
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const newCourt = queryRunner.manager.create(Court, {
        courtName: createCourtDto.name,
        address: createCourtDto.address,
        description: createCourtDto.description,
        pricePerHour: createCourtDto.pricePerHour,
        subService: createCourtDto.subService,
        owner: owner,
        isActive: true,
        sportType: sportType,
        lat: createCourtDto.lat,
        lng: createCourtDto.lng,
      });
      const savedCourt = await queryRunner.manager.save(newCourt);
      const { imgUrls } = createCourtDto;
      if (imgUrls && imgUrls.length > 0) {
        const courtImagesToSave = imgUrls.map((url) => {
          return queryRunner.manager.create(CourtImage, {
            imageUrl: url,
            court: savedCourt,
          });
        });
        await queryRunner.manager.save(courtImagesToSave);
      }
      await queryRunner.commitTransaction();
      const foundCourt = await this.courtRepository.findOne({
        where: { courtId: savedCourt.courtId },
        relations: ['owner', 'sportType', 'courtImages'],
      });
      if (!foundCourt) {
        throw new HttpException(
          'Failed to re-fetch court after creation',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
      return foundCourt;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        { message: error.message || 'Error creating court' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async updateCourt(
    id: string,
    editCourtDto: EditCourtDto,
    ownerId: string,
  ): Promise<Court> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Tìm sân và kiểm tra quyền
      const owner = await this.userRepository.findOneBy({ userId: ownerId });
      if (!owner) {
        throw new HttpException(
          { message: 'Chủ sở hữu không tồn tại' },
          HttpStatus.NOT_FOUND,
        );
      }
      if (owner.role !== Role.OWNER) {
        throw new HttpException(
          { message: 'Chỉ chủ sở hữu mới có thể sửa sân' },
          HttpStatus.FORBIDDEN,
        );
      }
      const court = await queryRunner.manager.findOne(Court, {
        where: { courtId: id },
        relations: ['owner'],
      });

      if (!court) {
        throw new HttpException('Không tìm thấy sân', HttpStatus.NOT_FOUND);
      }
      if (court.owner.userId !== owner.userId) {
        throw new HttpException(
          'Bạn không có quyền sửa sân này',
          HttpStatus.FORBIDDEN,
        );
      }

      // 2. Tách các thuộc tính ra
      // DTO của bạn dùng 'name', 'sportType' nhưng Entity dùng 'courtName', 'sportTypeId'
      const { name, sportType, imgUrls, ...restOfDto } = editCourtDto;

      // 3. Gộp các trường đơn giản (address, description, price, ...)
      queryRunner.manager.merge(Court, court, restOfDto);

      // 4. Xử lý các trường có tên không khớp BẰNG TAY
      if (name) {
        court.courtName = name;
      }

      // 5. Xử lý quan hệ 'sportType' BẰNG TAY
      if (sportType) {
        const sportTypeEntity = await this.sportTypeRepository.findOneBy({
          sportTypeId: sportType,
        });
        if (!sportTypeEntity) {
          throw new HttpException(
            'Loại hình thể thao không tồn tại',
            HttpStatus.NOT_FOUND,
          );
        }
        court.sportType = sportTypeEntity;
      }

      // 6. Xử lý quan hệ 'imgUrls' BẰNG TAY (Xóa cũ, thêm mới)
      if (imgUrls && imgUrls.length > 0) {
        // 6a. Xóa tất cả ảnh cũ của sân này
        await queryRunner.manager.delete(CourtImage, {
          court: { courtId: id },
        });

        // 6b. Tạo các thực thể ảnh mới
        const courtImagesToSave = imgUrls.map((url) => {
          return queryRunner.manager.create(CourtImage, {
            imageUrl: url,
            court: court, // Gán lại cho sân đang cập nhật
          });
        });

        // 6c. Lưu mảng ảnh mới vào DB
        await queryRunner.manager.save(courtImagesToSave);
      }

      // 7. Lưu tất cả thay đổi của 'court'
      await queryRunner.manager.save(court);

      // 8. Commit transaction
      await queryRunner.commitTransaction();

      // 9. Trả về dữ liệu đã được cập nhật đầy đủ
      return this.findDetailById(id); // Gọi lại hàm findDetailById để lấy full quan hệ
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Lỗi khi cập nhật sân',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } finally {
      await queryRunner.release();
    }
  }
  async paginate(
    options: IPaginationOptions,
    sportTypeId?: string,
    search?: string,
  ): Promise<Pagination<Court>> {
    // --- BƯỚC 1: XÂY DỰNG QUERY CHÍNH (KHÔNG JOIN ONE-TO-MANY) ---
    const queryBuilder = this.courtRepository.createQueryBuilder('court');
    queryBuilder
      .leftJoinAndSelect('court.sportType', 'sportType')
      .leftJoin('court.ratings', 'rating')
      .addSelect('COALESCE(AVG(rating.star), 0)', 'court_avgRating')
      .orderBy('court.courtName', 'ASC')
      .groupBy('court.courtId, sportType.sportTypeId');

    // Áp dụng filter và search
    if (sportTypeId) {
      queryBuilder.andWhere('sportType.sportTypeId = :sportTypeId', {
        sportTypeId,
      });
    }
    if (search) {
      queryBuilder.andWhere(
        '(court.courtName ILIKE :search OR court.description ILIKE :search OR court.address ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // --- BƯỚC 2: THỰC HIỆN PHÂN TRANG ĐỂ LẤY KẾT QUẢ CHÍNH ---
    const paginatedCourts = await paginate<Court>(queryBuilder, options);

    // --- BƯỚC 3: LẤY CÁC QUAN HỆ ONE-TO-MANY RIÊNG ---
    // Lấy ra danh sách các ID của sân đã được phân trang
    const courtIds = paginatedCourts.items.map((court) => court.courtId);

    if (courtIds.length > 0) {
      // Tìm tất cả các ảnh của các sân đó trong một query duy nhất
      const courtImages = await this.courtImageRepository.find({
        where: { court: { courtId: In(courtIds) } },
        relations: ['court'],
      });

      // Gắn ảnh trở lại vào từng sân
      paginatedCourts.items.forEach((court) => {
        court.courtImages = courtImages.filter(
          (image) => image.court.courtId === court.courtId,
        );
      });
    }

    return paginatedCourts;
  }

  async paginateForOwner(
    ownerId: string,
    options: IPaginationOptions,
    sportTypeId?: string,
    search?: string,
  ): Promise<Pagination<Court>> {
    // --- BƯỚC 1: XÂY DỰNG QUERY CHÍNH (KHÔNG JOIN courtImages) ---
    const queryBuilder = this.courtRepository.createQueryBuilder('court');

    queryBuilder
      .leftJoinAndSelect('court.sportType', 'sportType')
      .where('court.ownerId = :ownerId', { ownerId })
      .orderBy('court.courtName', 'ASC');

    if (sportTypeId) {
      queryBuilder.andWhere('sportType.sportTypeId = :sportTypeId', {
        sportTypeId,
      });
    }

    if (search) {
      queryBuilder.andWhere(
        '(court.courtName ILIKE :search OR court.description ILIKE :search OR court.address ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // --- BƯỚC 2: PHÂN TRANG ĐỂ LẤY ĐÚNG ID CỦA 10 SÂN ---
    const paginatedResult = await paginate<Court>(queryBuilder, options);

    // --- BƯỚC 3: LẤY ẢNH CHO 10 SÂN ĐÓ TRONG MỘT QUERY RIÊNG ---
    const courtIds = paginatedResult.items.map((court) => court.courtId);

    if (courtIds.length === 0) {
      return paginatedResult; // Trả về luôn nếu không có sân nào
    }

    // Lấy tất cả ảnh của các sân đã được phân trang
    const allImages = await this.courtImageRepository.find({
      where: { court: { courtId: In(courtIds) } },
      relations: ['court'], // Load cả quan hệ court để so sánh
    });

    // --- BƯỚC 4: GẮN ẢNH TRỞ LẠI VÀO TỪNG SÂN ---
    paginatedResult.items.forEach((court) => {
      court.courtImages = allImages.filter(
        (image) => image.court.courtId === court.courtId,
      );
    });

    return paginatedResult;
  }

  async deleteCourtDto(userId: string, courtId: string): Promise<void> {
    const owner = await this.userRepository.findOneBy({ userId });
    if (!owner) {
      throw new HttpException(
        { message: 'Current user not found.' },
        HttpStatus.NOT_FOUND,
      );
    }
    const court = await this.courtRepository.findOne({
      where: { courtId: courtId },
      relations: ['owner'],
    });
    if (!court) {
      throw new HttpException(
        { message: 'Court not found' },
        HttpStatus.NOT_FOUND,
      );
    }
    if (court.owner.userId !== owner.userId) {
      throw new HttpException(
        { message: 'You do not have permission to delete this court' },
        HttpStatus.FORBIDDEN,
      );
    }
    if (court.isActive) {
      court.isActive = false;
    } else {
      court.isActive = true;
    }
    try {
      await this.courtRepository.save(court);
    } catch (error) {
      throw new HttpException(
        { message: 'Error deleting court' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findNearBy(lat: number, lng: number): Promise<NearByCourt[]> {
    const radius = Number(process.env.LIMIT_RADIUS_NEARBY) || 10000;

    const degLat = radius / 111320;
    const degLng = radius / (111320 * Math.cos((lat * Math.PI) / 180));

    const minLat = lat - degLat;
    const maxLat = lat + degLat;
    const minLng = lng - degLng;
    const maxLng = lng + degLng;

    // SQL an toàn: tính distance trong subquery (có cast sang double precision để tránh lỗi khi c.lat/c.lng là text)
    const sql = `
      SELECT 
        q."courtId" AS id, 
        q."courtName" AS name, 
        q."address" AS address,
        q."pricePerHour" AS "pricePerHour",
        q."avgRating" AS "avgRating",
        q.lat AS lat, 
        q.lng AS lng, 
        q.distance AS distance,
        MIN(ci."imageUrl") AS "imageUrl"
      FROM (
        SELECT 
          c."courtId", 
          c."courtName", 
          c."address",
          c."pricePerHour",
          c."avgRating",
          c.lat, 
          c.lng,
          (
            6371000 * 2 * asin(
              sqrt(
                pow(sin(radians(CAST(c.lat AS double precision) - $1) / 2), 2) +
                cos(radians($1)) * cos(radians(CAST(c.lat AS double precision))) *
                pow(sin(radians(CAST(c.lng AS double precision) - $2) / 2), 2)
              )
            )
          ) AS distance
        FROM "court" c
        WHERE CAST(c.lat AS double precision) BETWEEN $3 AND $4
          AND CAST(c.lng AS double precision) BETWEEN $5 AND $6
      ) q
      LEFT JOIN "court_image" ci ON ci."courtId" = q."courtId"
      WHERE q.distance <= $7
      GROUP BY q."courtId", q."courtName", q."address", q."pricePerHour", q."avgRating", q.lat, q.lng, q.distance
      ORDER BY q.distance ASC; 
    `;

    const params = [lat, lng, minLat, maxLat, minLng, maxLng, radius];

    const rows: Array<{
      id: string;
      name: string;
      lat: string | number;
      lng: string | number;
      distance: number;
      pricePerHour: number;
      avgRating: number;
      address: string;
      imageUrl: string;
    }> = await this.courtRepository.query(sql, params);

    return rows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      latitude: Number.parseFloat(String(r.lat)),
      longitude: Number.parseFloat(String(r.lng)),
      distance: Math.round(Number(r.distance)),
      pricePerHour: r.pricePerHour,
      avgRating: r.avgRating,
      address: r.address,
      imageUrl: r.imageUrl,
    }));
  }
  async findDetailById(courtId: string): Promise<Court> {
    const court = await this.courtRepository.findOne({
      where: { courtId: courtId },
      relations: ['owner', 'sportType', 'courtImages'],
    });
    if (!court) {
      throw new HttpException(
        `Court with ID "${courtId}" not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    const ratingStats = await this.courtRepository
      .createQueryBuilder('court')
      .leftJoin('court.ratings', 'rating')
      .select('COALESCE(AVG(rating.star), 0)', 'avgRating')
      .where('court.courtId = :courtId', { courtId })
      .getRawOne();

    court.avgRating = parseFloat(ratingStats.avgRating);

    return court;
  }

  async getAvailableSlots(courtId: string, date: string): Promise<TimeSlot[]> {
    // 1. Tạo danh sách tất cả các slot có thể có trong ngày (ví dụ: từ 5h đến 23h)
    const allSlots: TimeSlot[] = [];
    for (let i = 5; i < 23; i++) {
      const startHour = i.toString().padStart(2, '0');
      const endHour = (i + 1).toString().padStart(2, '0');
      allSlots.push({
        id: `slot-${startHour}00-${endHour}00`,
        start: `${startHour}:00`,
        end: `${endHour}:00`,
        locked: false,
      });
    }

    // 2. Tìm tất cả các booking đã tồn tại cho sân này trong ngày này
    const searchDate = new Date(date);
    const startOfDay = new Date(searchDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(searchDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const bookedSlots = await this.bookingRepository.find({
      where: {
        court: { courtId: courtId },
        startTime: Between(startOfDay, endOfDay),
        status: In([BookingStatus.CONFIRMED, BookingStatus.PENDING_DEPOSIT]),
      },
    });

    // Tạo một Set chứa giờ bắt đầu của các slot đã bị khóa để tra cứu nhanh
    const bookedHours = new Set(
      bookedSlots.map((b) => b.startTime.getUTCHours()),
    );

    // 3. Đánh dấu các slot đã bị khóa
    allSlots.forEach((slot) => {
      const slotStartHour = parseInt(slot.start.split(':')[0]);
      if (bookedHours.has(slotStartHour)) {
        slot.locked = true;
      }
    });

    return allSlots;
  }

  async getBookedCourtsByUser(
    userId: string,
    options: IPaginationOptions,
  ): Promise<Pagination<Court>> {
    const queryBuilder = this.courtRepository.createQueryBuilder('court');

    queryBuilder
      .innerJoin('court.bookings', 'booking')
      .leftJoinAndSelect('court.owner', 'owner')
      .leftJoinAndSelect('court.sportType', 'sportType')
      .leftJoinAndSelect('court.courtImages', 'courtImages')
      .where('booking.userId = :userId', { userId })
      .groupBy(
        'court.courtId, owner.userId, sportType.sportTypeId, courtImages.imageId',
      );

    return paginate<Court>(queryBuilder, options);
  }
  async getOwnerDashboard(
    ownerId: string,
    dashboardRequestDTO: DashboardRequestDTO,
  ) {
    const { startDate, endDate } = dashboardRequestDTO;
    // --- GIAI ĐOẠN 1: XÂY DỰNG CÁC QUERY BUILDER ---

    // Query 1: Thống kê doanh thu
    const revenueQuery = this.paymentRepository
      .createQueryBuilder('payment')
      .innerJoin('payment.bookingOrder', 'bookingOrder')
      .innerJoin('bookingOrder.bookings', 'booking')
      .innerJoin('booking.court', 'court')
      .select('SUM(payment.amount)', 'totalRevenue')
      .where('court.ownerId = :ownerId', { ownerId })
      .andWhere('payment.paymentStatus = :status', {
        status: PaymentStatus.SUCCESS,
      });

    // Query 2: Thống kê trạng thái các đơn hàng
    const orderStatsQuery = this.bookingOrderRepository
      .createQueryBuilder('order')
      .innerJoin('order.bookings', 'booking')
      .innerJoin('booking.court', 'court')
      .select('order.status', 'status')
      .addSelect('COUNT(DISTINCT order.orderId)', 'count')
      .where('court.ownerId = :ownerId', { ownerId })
      .groupBy('order.status');

    // Query 3 & 4: Sân có nhiều/ít lượt book nhất
    const courtRankingQuery = this.bookingRepository
      .createQueryBuilder('booking')
      .innerJoin('booking.court', 'court')
      .select('court.courtName', 'courtName')
      .addSelect('COUNT(booking.bookingId)', 'bookingCount')
      .where('court.ownerId = :ownerId', { ownerId })
      .groupBy('court.courtName')
      // Sửa lại dòng này
      .orderBy('"bookingCount"', 'DESC'); // <-- Thêm dấu ngoặc kép

    const monthlyStatsQuery = this.bookingRepository
      .createQueryBuilder('booking')
      .innerJoin('booking.court', 'court')
      .select("DATE_TRUNC('month', booking.bookingDate)", 'month') // Trích xuất và nhóm theo tháng
      .addSelect('COUNT(booking.bookingId)', 'count')
      .where('court.ownerId = :ownerId', { ownerId })
      .groupBy('month') // Nhóm kết quả theo tháng
      .orderBy('month', 'ASC'); // Sắp xếp theo thứ tự thời gian

    // --- GIAI ĐOẠN 2: THÊM BỘ LỌC THỜI GIAN (NẾU CÓ) ---
    if (startDate && endDate) {
      revenueQuery.andWhere(
        'payment.createdAt BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
      orderStatsQuery.andWhere(
        'order.createdAt BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
      courtRankingQuery.andWhere(
        'booking.createdAt BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
      monthlyStatsQuery.andWhere(
        'booking.bookingDate BETWEEN :startDate AND :endDate',
        { startDate, endDate },
      );
    }

    // --- GIAI ĐOẠN 3: THỰC THI TẤT CẢ CÁC QUERY ---
    const [revenueResult, orderStats, courtRankings, monthlyStats] =
      await Promise.all([
        revenueQuery.getRawOne(),
        orderStatsQuery.getRawMany(),
        courtRankingQuery.getRawMany(),
        monthlyStatsQuery.getRawMany(),
      ]);

    // --- GIAI ĐOẠN 4: XỬ LÝ KẾT QUẢ ---
    const stats = {
      cancelledOrders: 0,
      completedOrders: 0,
      pendingDepositOrders: 0,
    };
    orderStats.forEach((stat) => {
      if (stat.status === BookingStatus.CANCELLED)
        stats.cancelledOrders = parseInt(stat.count);
      if (stat.status === BookingStatus.COMPLETED)
        stats.completedOrders = parseInt(stat.count);
      if (stat.status === BookingStatus.PENDING_DEPOSIT)
        stats.pendingDepositOrders = parseInt(stat.count);
    });

    const mostBookedCourt = courtRankings.length > 0 ? courtRankings[0] : null;
    const leastBookedCourt =
      courtRankings.length > 0 ? courtRankings[courtRankings.length - 1] : null;
    const monthlyBookingStats = monthlyStats.map((stat) => ({
      // Chuyển đổi định dạng ngày thành 'YYYY-MM' cho FE dễ dùng
      month: stat.month.toISOString().substring(0, 7),
      count: parseInt(stat.count, 10),
    }));

    return {
      totalRevenue: parseFloat(revenueResult?.totalRevenue) || 0,
      ...stats,
      mostBookedCourt: mostBookedCourt
        ? {
            name: mostBookedCourt.courtName,
            count: parseInt(mostBookedCourt.bookingCount),
          }
        : null,
      leastBookedCourt: leastBookedCourt
        ? {
            name: leastBookedCourt.courtName,
            count: parseInt(leastBookedCourt.bookingCount),
          }
        : null,
      monthlyBookingStats: monthlyBookingStats,
    };
  }
}
