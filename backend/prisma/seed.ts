import { PrismaClient, VehicleType, OrderVehicleType, ServiceType, OrderStatus, PaymentMethod, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing database...');
  await prisma.providerEarning.deleteMany({});
  await prisma.rating.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.provider.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('Seeding Users...');
  const user1 = await prisma.user.create({
    data: {
      name: 'Rohan Sharma',
      phone: '9876543210',
      email: 'rohan@example.com',
      profilePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Priya Patel',
      phone: '9876543211',
      email: 'priya@example.com',
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    },
  });

  console.log('Seeding Providers...');
  const provider1 = await prisma.provider.create({
    data: {
      name: 'Ramesh Puncture Wala',
      phone: '8888888881',
      aadharNumber: '123456789012',
      vehicleType: VehicleType.BIKE,
      skills: ['PUNCTURE', 'SPARK_PLUG', 'CHAIN', 'BRAKE_WIRE'],
      isVerified: true,
      isOnline: true,
      currentLat: 19.0760, // Near Mumbai center
      currentLng: 72.8777,
      rating: 4.8,
      totalOrders: 142,
      walletBalance: 2450.00,
      profilePhotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80',
    },
  });

  const provider2 = await prisma.provider.create({
    data: {
      name: 'Suresh Battery Expert',
      phone: '8888888882',
      aadharNumber: '223456789012',
      vehicleType: VehicleType.BIKE,
      skills: ['BATTERY', 'NOT_STARTING', 'BULB'],
      isVerified: true,
      isOnline: true,
      currentLat: 19.0820,
      currentLng: 72.8820,
      rating: 4.9,
      totalOrders: 98,
      walletBalance: 1200.00,
      profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    },
  });

  await prisma.provider.create({
    data: {
      name: 'Amit Fuel Express',
      phone: '8888888883',
      aadharNumber: '323456789012',
      vehicleType: VehicleType.BICYCLE,
      skills: ['FUEL'],
      isVerified: true,
      isOnline: true,
      currentLat: 19.0650,
      currentLng: 72.8680,
      rating: 4.5,
      totalOrders: 32,
      walletBalance: 400.00,
      profilePhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    },
  });

  await prisma.provider.create({
    data: {
      name: 'Jaggu Towing Services',
      phone: '8888888884',
      aadharNumber: '423456789012',
      vehicleType: VehicleType.TRUCK,
      skills: ['TOWING'],
      isVerified: true,
      isOnline: true,
      currentLat: 19.0900,
      currentLng: 72.8900,
      rating: 4.7,
      totalOrders: 56,
      walletBalance: 5600.00,
      profilePhotoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
    },
  });

  console.log('Seeding Completed Orders...');
  const order1 = await prisma.order.create({
    data: {
      userId: user1.id,
      providerId: provider1.id,
      vehicleType: OrderVehicleType.BIKE,
      serviceType: ServiceType.PUNCTURE,
      status: OrderStatus.COMPLETED,
      userLat: 19.0758,
      userLng: 72.8770,
      userAddress: 'Phoenix Marketcity, Kurla, Mumbai',
      distanceKm: 0.8,
      basePrice: 80.00,
      distanceCharge: 8.00,
      totalPrice: 88.00,
      platformCommission: 17.60,
      providerEarning: 70.40,
      paymentMethod: PaymentMethod.CASH,
      paymentStatus: PaymentStatus.PAID,
      otp: '4821',
      createdAt: new Date(Date.now() - 3600000 * 2), // 2 hours ago
      completedAt: new Date(Date.now() - 3600000 * 1.5),
    },
  });

  await prisma.rating.create({
    data: {
      orderId: order1.id,
      userId: user1.id,
      providerId: provider1.id,
      rating: 5,
      review: 'Bhaiya came in 10 mins and fixed the flat tire very quickly. Highly recommended!',
    },
  });

  const order2 = await prisma.order.create({
    data: {
      userId: user2.id,
      providerId: provider2.id,
      vehicleType: OrderVehicleType.CAR,
      serviceType: ServiceType.BATTERY,
      status: OrderStatus.COMPLETED,
      userLat: 19.0830,
      userLng: 72.8835,
      userAddress: 'Saki Naka Metro Station, Andheri East, Mumbai',
      distanceKm: 1.5,
      basePrice: 150.00,
      distanceCharge: 22.50,
      totalPrice: 172.50,
      platformCommission: 34.50,
      providerEarning: 138.00,
      paymentMethod: PaymentMethod.ONLINE,
      paymentStatus: PaymentStatus.PAID,
      otp: '7392',
      createdAt: new Date(Date.now() - 3600000 * 24), // 24 hours ago
      completedAt: new Date(Date.now() - 3600000 * 23.2),
    },
  });

  await prisma.rating.create({
    data: {
      orderId: order2.id,
      userId: user2.id,
      providerId: provider2.id,
      rating: 4,
      review: 'Quick service, battery jumpstart worked immediately. A bit expensive but worth it.',
    },
  });

  console.log('Seeding database complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
