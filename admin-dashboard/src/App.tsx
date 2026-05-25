import { useState, useEffect, useRef } from 'react';
import { 
  Wrench, 
  MapPin, 
  User, 
  UserCheck, 
  Smartphone, 
  BarChart3, 
  Navigation, 
  Star, 
  Wallet,
  AlertTriangle,
  RotateCcw,
  LogOut,
  CheckCircle,
  TrendingUp,
  Filter,
  Check
} from 'lucide-react';
import io from 'socket.io-client';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';

const BACKEND_URL = 'http://localhost:5000';

// Mock values for offline fallback
const MOCK_PROVIDERS = [
  { id: '1', name: 'Ramesh Puncture Wala', phone: '8888888881', vehicleType: 'BIKE', skills: ['PUNCTURE', 'SPARK_PLUG'], rating: 4.8, isOnline: true, walletBalance: 2450, currentLat: 19.0760, currentLng: 72.8777, isVerified: true, aadharNumber: '3291-8492-7891', licenseNumber: 'MH-14-2019-0089123', insuranceCode: 'INS-90812-PRV' },
  { id: '2', name: 'Suresh Battery Expert', phone: '8888888882', vehicleType: 'BIKE', skills: ['BATTERY', 'NOT_STARTING'], rating: 4.9, isOnline: true, walletBalance: 1200, currentLat: 19.0820, currentLng: 72.8820, isVerified: true, aadharNumber: '9082-1249-9812', licenseNumber: 'MH-03-2021-0029812', insuranceCode: 'INS-10892-PRV' },
  { id: '3', name: 'Amit Fuel Express', phone: '8888888883', vehicleType: 'BICYCLE', skills: ['FUEL'], rating: 4.5, isOnline: true, walletBalance: 400, currentLat: 19.0650, currentLng: 72.8680, isVerified: false, aadharNumber: '7821-9081-3290', licenseNumber: 'MH-12-2022-0045678', insuranceCode: 'INS-45678-PRV' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'simulator' | 'admin'>('simulator');
  const [socket, setSocket] = useState<any>(null);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // System Stats (commented out as unused)
  /*
  const [stats, setStats] = useState({
    completedOrders: 2,
    revenue: 52.10,
    activeProviders: 3,
    totalUsers: 2
  });
  */

  // DB Lists
  const [providers, setProviders] = useState<any[]>(MOCK_PROVIDERS);

  // Admin Sub-Tab States
  const [adminSubTab, setAdminSubTab] = useState<'overview' | 'onboarding' | 'orders' | 'pricing'>('overview');
  const [ordersFilter, setOrdersFilter] = useState<string>('ALL');
  
  const [pricingConfig, setPricingConfig] = useState<any>({
    PUNCTURE: { base: 80, perKmBike: 10, perKmCar: 15 },
    FUEL: { base: 150, perKmBike: 10, perKmCar: 15 },
    SPARK_PLUG: { base: 120, perKmBike: 10, perKmCar: 15 },
    CHAIN: { base: 150, perKmBike: 10, perKmCar: 15 },
    BATTERY: { base: 150, perKmBike: 10, perKmCar: 15 },
    BRAKE_WIRE: { base: 120, perKmBike: 10, perKmCar: 15 },
    TOWING: { base: 300, perKmBike: 15, perKmCar: 50 },
    COOLANT: { base: 150, perKmBike: 10, perKmCar: 15 },
    OIL: { base: 150, perKmBike: 10, perKmCar: 15 },
    BULB: { base: 100, perKmBike: 10, perKmCar: 10 },
    NOT_STARTING: { base: 200, perKmBike: 10, perKmCar: 15 }
  });

  const [ordersList, setOrdersList] = useState<any[]>([
    { id: 'ORD-981', serviceType: 'PUNCTURE', vehicleType: 'BIKE', totalPrice: 92.00, platformCommission: 18.40, providerEarning: 73.60, paymentMethod: 'CASH', status: 'COMPLETED', userAddress: 'Phoenix Marketcity Mall Gate 2', customerName: 'Rohan Sharma', createdAt: new Date(Date.now() - 3600000 * 2).toISOString(), rating: 5, review: 'Super fast mechanic response!' },
    { id: 'ORD-102', serviceType: 'BATTERY', vehicleType: 'CAR', totalPrice: 235.00, platformCommission: 47.00, providerEarning: 188.00, paymentMethod: 'ONLINE', status: 'COMPLETED', userAddress: 'LBS Marg Flyover Crossing', customerName: 'Khushi Shah', createdAt: new Date(Date.now() - 3600000 * 24).toISOString(), rating: 4, review: 'Friendly partner jumpstarted battery.' }
  ]);

  // ----------------------------------------------------
  // CUSTOMER STATE
  // ----------------------------------------------------
  const [customerPhone, setCustomerPhone] = useState('9876543210');
  const [customerName, setCustomerName] = useState('Rohan Sharma');
  const [customerToken, setCustomerToken] = useState<string | null>(null);
  const [customerUser, setCustomerUser] = useState<any>(null);
  const [customerStep, setCustomerStep] = useState<'login' | 'home' | 'booking' | 'searching' | 'tracking' | 'completed'>('login');
  
  // Booking parameters
  const [selectedVehicle, setSelectedVehicle] = useState<'BIKE' | 'CAR'>('BIKE');
  const [selectedService, setSelectedService] = useState<string>('PUNCTURE');
  const [selectedPayment, setSelectedPayment] = useState<'CASH' | 'ONLINE'>('CASH');
  const pickupAddress = 'Phoenix Marketcity, Kurla, Mumbai';
  const [distance, setDistance] = useState(1.2); // mock KM
  const [priceDetails, setPriceDetails] = useState<any>({ totalPrice: 92.00, basePrice: 80, distanceCharge: 12 });
  
  // Booking active state
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [assignedProvider, setAssignedProvider] = useState<any>(null);
  const [ratingVal, setRatingVal] = useState(5);
  const [reviewVal, setReviewVal] = useState('');

  // ----------------------------------------------------
  // PROVIDER STATE
  // ----------------------------------------------------
  const [providerPhone, setProviderPhone] = useState('8888888881');
  const [providerProfile, setProviderProfile] = useState<any>(MOCK_PROVIDERS[0]);
  const [providerStep, setProviderStep] = useState<'login' | 'home' | 'navigation' | 'in_progress'>('login');
  
  const [incomingRequest, setIncomingRequest] = useState<any>(null);
  const [countdown, setCountdown] = useState(15);
  const [providerNavProgress, setProviderNavProgress] = useState(0); // 0 to 4 clicks to arrive

  // ----------------------------------------------------
  // INITIAL LOGGING & SOCKET BINDING
  // ----------------------------------------------------
  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSystemLogs(prev => [...prev, `[${timestamp}] ${msg}`]);
  };

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [systemLogs]);

  useEffect(() => {
    // Establish Socket connection
    const newSocket = io(BACKEND_URL);
    setSocket(newSocket);
    addLog('Establishing Socket.io connection to backend...');

    newSocket.on('connect', () => {
      addLog(`Socket connected! Socket ID: ${newSocket.id}`);
    });

    newSocket.on('disconnect', () => {
      addLog('Socket disconnected from server.');
    });

    // Load active logs and stats
    fetchData();

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Listen to Customer sockets
  useEffect(() => {
    if (!socket || !customerUser) return;

    socket.emit('user:join', { userId: customerUser.id });
    addLog(`User Socket room registered for: ${customerUser.name}`);

    socket.on('order:accepted', (data: any) => {
      addLog(`[Realtime] ORDER ACCEPTED by mechanic ${data.provider.name}!`);
      // Update state
      setAssignedProvider(data.provider);
      setCustomerStep('tracking');
      // Sync order details
      fetchOrderDetails(data.orderId);
    });

    socket.on('order:status_update', (data: any) => {
      addLog(`[Realtime] Order status changed to: ${data.status}`);
      if (data.status === 'PROVIDER_ON_WAY') {
        fetchOrderDetails(data.orderId);
      } else if (data.status === 'IN_PROGRESS') {
        fetchOrderDetails(data.orderId);
      }
    });

    socket.on('order:provider_location', (coords: any) => {
      addLog(`[Realtime] Live GPS broadcast from mechanic: ${coords.lat}, ${coords.lng}`);
      // Update assigned provider position in state
      setAssignedProvider((prev: any) => prev ? { ...prev, currentLat: coords.lat, currentLng: coords.lng } : null);
    });

    socket.on('order:completed', () => {
      addLog('[Realtime] ORDER COMPLETED! Verification code verified successfully.');
      setCustomerStep('completed');
      fetchData();
    });

    socket.on('order:cancelled', (data: any) => {
      addLog(`[Realtime] Matching failed or cancelled: ${data.reason || ''}`);
      setCustomerStep('home');
      alert(data.reason || 'No available mechanics nearby accepted the request.');
    });

    return () => {
      socket.off('order:accepted');
      socket.off('order:status_update');
      socket.off('order:provider_location');
      socket.off('order:completed');
      socket.off('order:cancelled');
    };
  }, [socket, customerUser]);

  // Listen to Provider Sockets
  useEffect(() => {
    if (!socket || !providerProfile) return;

    socket.emit('provider:join', { providerId: providerProfile.id });
    addLog(`Provider Socket room registered for: ${providerProfile.name}`);

    socket.on('order:new_request', (order: any) => {
      addLog(`[Realtime] NEW INCOMING REQUEST! Paging for Puncture Fix`);
      setIncomingRequest(order);
      setCountdown(15);
    });

    socket.on('order:completed', () => {
      addLog(`[Realtime] Order completed! Wallet updated.`);
      setProviderStep('home');
      setIncomingRequest(null);
      fetchProviderEarnings();
    });

    socket.on('order:cancelled', () => {
      addLog(`[Realtime] Active order was cancelled.`);
      setProviderStep('home');
      setIncomingRequest(null);
    });

    return () => {
      socket.off('order:new_request');
      socket.off('order:completed');
      socket.off('order:cancelled');
    };
  }, [socket, providerProfile]);

  // Countdown timer for incoming request popup
  useEffect(() => {
    if (!incomingRequest || countdown <= 0) {
      if (countdown === 0 && incomingRequest) {
        addLog('[Matching] Incoming job request offer timed out.');
        setIncomingRequest(null);
      }
      return;
    }

    const interval = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [incomingRequest, countdown]);

  const fetchData = async () => {
    try {
      const statsRes = await fetch(`${BACKEND_URL}/api/health`);
      if (statsRes.ok) {
        addLog('Health check success, fetching operational data...');
      }

      // Query ALL registered providers from DB for the admin dashboard management view
      const provRes = await fetch(`${BACKEND_URL}/api/providers`);
      if (provRes.ok) {
        const provData = await provRes.json();
        if (provData && Array.isArray(provData) && provData.length > 0) {
          setProviders(provData);
        }
      }
    } catch (e) {
      addLog('Backend offline or database not responding. Running in simulator-only fallback.');
    }
  };

  const fetchProviderEarnings = async () => {
    if (!providerProfile) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/providers/${providerProfile.id}/earnings`);
      if (res.ok) {
        const data = await res.json();
        setProviderProfile((prev: any) => ({ 
          ...prev, 
          walletBalance: data.walletBalance,
          totalOrders: data.totalOrders,
          rating: data.rating 
        }));
        addLog(`Earnings fetched. Wallet Balance: ₹${data.walletBalance}`);
      }
    } catch (e) {}
  };

  const fetchOrderDetails = async (id: string) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/${id}`);
      if (res.ok) {
        const data = await res.json();
        setActiveOrder(data);
      }
    } catch (e) {}
  };

  // ----------------------------------------------------
  // CLIENT CORE HANDLERS
  // ----------------------------------------------------
  const handleCustomerLogin = async () => {
    addLog(`Sending OTP verification request for user: ${customerPhone}`);
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: customerPhone }),
      });
      const data = await res.json();
      
      addLog(`Verifying OTP automatically with token generator...`);
      const verifyRes = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: customerPhone, otp: data.otp || '123456', name: customerName }),
      });

      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        setCustomerToken(verifyData.token);
        setCustomerUser(verifyData.user);
        setCustomerStep('home');
        addLog(`Successfully logged in as Customer: ${verifyData.user.name}`);
      } else {
        addLog('Login verification failed.');
      }
    } catch (e) {
      // Local fallback
      const fallbackUser = { id: 'user-mock-uuid', name: customerName, phone: customerPhone };
      setCustomerUser(fallbackUser);
      setCustomerStep('home');
      addLog('[MOCK] Backend offline. Logged in as mock user.');
    }
  };

  const handleProviderLogin = async () => {
    addLog(`Initiating login validation for Provider: ${providerPhone}`);
    try {
      // First try to seed provider if missing in DB
      await fetch(`${BACKEND_URL}/api/providers/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Ramesh Puncture Wala',
          phone: '8888888881',
          aadharNumber: '123456789012',
          vehicleType: 'BIKE',
          skills: ['PUNCTURE', 'SPARK_PLUG', 'CHAIN'],
          currentLat: 19.0760,
          currentLng: 72.8777,
        })
      });

      const res = await fetch(`${BACKEND_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: providerPhone }),
      });
      const data = await res.json();

      const verifyRes = await fetch(`${BACKEND_URL}/api/auth/provider/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: providerPhone, otp: data.otp || '123456' }),
      });

      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        setProviderProfile(verifyData.provider);
        setProviderStep('home');
        addLog(`Logged in as Online Provider: ${verifyData.provider.name}`);
        fetchProviderEarnings();
      } else {
        addLog('Provider login verification failed.');
      }
    } catch (e) {
      // Local fallback
      setProviderProfile(MOCK_PROVIDERS.find(p => p.phone === providerPhone) || MOCK_PROVIDERS[0]);
      setProviderStep('home');
      addLog('[MOCK] Backend offline. Logged in as mock provider.');
    }
  };

  const calculateEstimate = async (service: string, vehicle: 'BIKE' | 'CAR') => {
    setSelectedService(service);
    setSelectedVehicle(vehicle);
    
    // Set typical mock distance
    const mockDist = service === 'TOWING' ? 8.4 : (service === 'FUEL' ? 4.2 : 2.5);
    setDistance(mockDist);

    // Use local pricingConfig state dynamically so that changes are instantly visible!
    const config = pricingConfig[service] || { base: 80, perKmBike: 10, perKmCar: 15 };
    const perKmRate = vehicle === 'BIKE' ? (config.perKmBike ?? 10) : (config.perKmCar ?? 15);
    const base = config.base;
    const distanceCharge = Math.round(mockDist * perKmRate * 100) / 100;
    const total = Math.round((base + distanceCharge) * 100) / 100;

    setPriceDetails({
      basePrice: base,
      distanceCharge: distanceCharge,
      totalPrice: total
    });
    setCustomerStep('booking');
  };

  const handleBookNow = async () => {
    addLog(`Creating job ticket for ${selectedService}...`);
    setCustomerStep('searching');

    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${customerToken}`
        },
        body: JSON.stringify({
          userId: customerUser.id,
          vehicleType: selectedVehicle,
          serviceType: selectedService,
          userLat: 19.0758,
          userLng: 72.8770,
          userAddress: pickupAddress,
          distanceKm: distance,
          paymentMethod: selectedPayment
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveOrder(data.order);
        setOrdersList(prev => [
          {
            id: data.order.id,
            serviceType: selectedService,
            vehicleType: selectedVehicle,
            totalPrice: priceDetails.totalPrice,
            platformCommission: priceDetails.totalPrice * 0.20,
            providerEarning: priceDetails.totalPrice * 0.80,
            paymentMethod: selectedPayment,
            status: 'ACCEPTED',
            userAddress: pickupAddress,
            customerName: customerName,
            createdAt: new Date().toISOString(),
          },
          ...prev
        ]);
        addLog(`Order placed successfully! Finding closest mechanic...`);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to place order.');
        setCustomerStep('home');
      }
    } catch (e) {
      addLog('[MOCK] Backend offline. Simulating order matching workflow...');
      // Simulated matching success after 3 seconds
      setTimeout(() => {
        const mockMech = MOCK_PROVIDERS[0];
        setAssignedProvider(mockMech);
        const newMockOrder = {
          id: 'ORD-' + Math.floor(100 + Math.random() * 900),
          otp: '4892',
          basePrice: priceDetails.basePrice,
          distanceCharge: priceDetails.distanceCharge,
          totalPrice: priceDetails.totalPrice,
          platformCommission: priceDetails.totalPrice * 0.20,
          providerEarning: priceDetails.totalPrice * 0.80,
          userLat: 19.0758,
          userLng: 72.8770,
          userAddress: pickupAddress,
          status: 'ACCEPTED',
          serviceType: selectedService,
          vehicleType: selectedVehicle,
          paymentMethod: selectedPayment,
          customerName: customerName,
          createdAt: new Date().toISOString()
        };
        setActiveOrder(newMockOrder);
        setOrdersList(prev => [newMockOrder, ...prev]);
        setCustomerStep('tracking');
        addLog(`[MOCK] Matching accepted by Suresh Battery Expert!`);
      }, 4000);
    }
  };

  // Provider order actions
  const handleAcceptJob = async () => {
    if (!incomingRequest) return;
    addLog(`Accepting job request...`);
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/${incomingRequest.id}/accept`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ providerId: providerProfile.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setActiveOrder(data.order);
        setIncomingRequest(null);
        setProviderStep('navigation');
        setProviderNavProgress(0);
        addLog(`Job accepted! Opening navigation to user's location.`);
      }
    } catch (e) {
      // Mock accept
      setActiveOrder(incomingRequest);
      setIncomingRequest(null);
      setProviderStep('navigation');
      setProviderNavProgress(0);
      addLog(`[MOCK] Offline job accepted.`);
    }
  };

  const handleDeclineJob = () => {
    addLog('Job offer declined by provider.');
    setIncomingRequest(null);
  };

  const simulateLocationUpdate = () => {
    if (!activeOrder || !providerProfile) return;
    
    // Simulate steps towards customer lat: 19.0758, lng: 72.8770
    const steps = [
      { lat: 19.0765, lng: 72.8785, desc: 'Mechanic departed. En-route on link road.' },
      { lat: 19.0762, lng: 72.8779, desc: 'Mechanic crossing LBS Marg junction.' },
      { lat: 19.0759, lng: 72.8772, desc: 'Mechanic near Phoenix Mall entry.' },
      { lat: 19.0758, lng: 72.8770, desc: 'Mechanic arrived! Spotting flat tire.' }
    ];

    const nextProgress = providerNavProgress + 1;
    if (nextProgress <= steps.length) {
      setProviderNavProgress(nextProgress);
      const step = steps[nextProgress - 1];

      addLog(`[Simulation] ${step.desc}`);

      // Emit over socket
      if (socket) {
        socket.emit('provider:location_update', {
          providerId: providerProfile.id,
          lat: step.lat,
          lng: step.lng,
          orderId: activeOrder.id
        });
      }

      // Update provider coordinates local state
      setProviderProfile((prev: any) => ({ ...prev, currentLat: step.lat, currentLng: step.lng }));

      if (nextProgress === steps.length) {
        // Trigger Arrived API
        handleMechanicArrived();
      }
    }
  };

  const handleMechanicArrived = async () => {
    addLog('Updating status to: ARRIVED');
    try {
      await fetch(`${BACKEND_URL}/api/orders/${activeOrder.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'IN_PROGRESS' }),
      });
      setProviderStep('in_progress');
    } catch (e) {
      setProviderStep('in_progress');
    }
  };

  const [otpInput, setOtpInput] = useState('');
  const handleJobCompletion = async () => {
    addLog(`Submitting verification OTP: ${otpInput}`);
    try {
      const res = await fetch(`${BACKEND_URL}/api/orders/${activeOrder.id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otpInput }),
      });

      if (res.ok) {
        addLog('OTP Validated successfully. Order transaction settled!');
        setOrdersList(prev => prev.map(o => o.id === activeOrder.id ? { ...o, status: 'COMPLETED' } : o));
        setProviderStep('home');
        fetchProviderEarnings();
      } else {
        const err = await res.json();
        alert(err.error || 'Invalid OTP. Please check with customer.');
      }
    } catch (e) {
      // Mock checkout completion
      if (otpInput === activeOrder?.otp || otpInput === '1234') {
        addLog('[MOCK] OTP verified. Order completed.');
        setOrdersList(prev => prev.map(o => o.id === activeOrder.id ? { ...o, status: 'COMPLETED' } : o));
        setProviderStep('home');
        setCustomerStep('completed');
      } else {
        alert('Incorrect OTP code.');
      }
    }
  };

  const submitCustomerRating = async () => {
    addLog(`Submitting rating feedback score: ${ratingVal}`);
    try {
      const res = await fetch(`${BACKEND_URL}/api/ratings/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: activeOrder.id,
          userId: customerUser.id,
          rating: ratingVal,
          review: reviewVal
        }),
      });
      if (res.ok) {
        addLog('Feedback recorded. Thank you!');
        setOrdersList(prev => prev.map(o => o.id === activeOrder.id ? { ...o, rating: ratingVal, review: reviewVal } : o));
        setCustomerStep('home');
        fetchData();
      }
    } catch (e) {
      setOrdersList(prev => prev.map(o => o.id === activeOrder.id ? { ...o, rating: ratingVal, review: reviewVal } : o));
      setCustomerStep('home');
    }
  };

  const triggerSystemReset = async () => {
    addLog('Resetting operational database to pristine seed status...');
    try {
      const res = await fetch(`${BACKEND_URL}/api/debug/reset`, { method: 'POST' });
      if (res.ok) {
        await res.json();
        addLog('Operational clean sweep completed! Default accounts loaded.');
        fetchData();
      }
    } catch (e) {
      addLog('Reset API unreachable.');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Navbar */}
      <div className="navbar glass-panel">
        <div className="logo">
          <Wrench size={24} style={{ stroke: '#3b82f6', fill: 'rgba(59,130,246,0.1)' }} />
          <span>RoadAssist<span style={{ fontSize: '12px', fontWeight: '500', color: '#10b981', marginLeft: '6px' }}>Simulator v1.0</span></span>
        </div>

        <div className="nav-tabs">
          <button 
            className={`nav-tab-btn ${activeTab === 'simulator' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulator')}
          >
            <Smartphone size={16} />
            <span>Interactive Simulator</span>
          </button>
          <button 
            className={`nav-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <BarChart3 size={16} />
            <span>Admin Dashboard</span>
          </button>
        </div>

        <button className="btn-secondary" onClick={triggerSystemReset} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '13px' }}>
          <RotateCcw size={14} />
          Reset DB
        </button>
      </div>

      {/* Main Container */}
      {activeTab === 'simulator' ? (
        <div className="simulator-layout">
          
          {/* CUSTOMER APP FRAME */}
          <div className="simulator-side">
            <h2 className="logs-title">
              <Smartphone size={16} />
              Customer Mobile App
            </h2>
            <div className="phone-wrapper">
              <div className="phone-notch"><div className="phone-notch-speaker" /></div>
              
              <div className="phone-content">
                {customerStep === 'login' && (
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                    <div style={{ textAlign: 'center', margin: '40px 0 20px' }}>
                      <Wrench size={48} color="#3b82f6" style={{ margin: '0 auto' }} />
                      <h2 style={{ marginTop: '16px', fontSize: '24px', fontWeight: '800' }}>RoadAssist</h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '8px' }}>Emergency Mechanic At Your Location</p>
                    </div>
                    
                    <div style={{ marginTop: '24px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Full Name</label>
                      <input 
                        type="text" 
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white', marginTop: '6px', fontSize: '14px', outline: 'none' }}
                      />
                    </div>

                    <div style={{ marginTop: '16px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Phone Number</label>
                      <input 
                        type="text" 
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white', marginTop: '6px', fontSize: '14px', outline: 'none' }}
                      />
                    </div>

                    <button className="btn-primary" onClick={handleCustomerLogin} style={{ marginTop: '32px', width: '100%' }}>
                      Verify with OTP
                    </button>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '16px' }}>By logging in, you agree to 20% platform brokerage cuts.</p>
                  </div>
                )}

                {customerStep === 'home' && (
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Welcome back</p>
                        <h4 style={{ fontSize: '16px', fontWeight: '700' }}>{customerUser?.name}</h4>
                      </div>
                      <button onClick={() => setCustomerStep('login')} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <LogOut size={16} />
                      </button>
                    </div>

                    <div className="glass-card" style={{ padding: '16px', marginBottom: '20px', background: 'linear-gradient(to right, rgba(59,130,246,0.1), transparent)' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: '700', color: '#60a5fa' }}>Need roadside help?</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>Select your vehicle and let nearby mechanics come to you in 30 mins.</p>
                    </div>

                    <h5 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>Services for Bike</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                      <button onClick={() => calculateEstimate('PUNCTURE', 'BIKE')} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '10px', color: 'white', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: '700', fontSize: '13px' }}>Puncture Fix</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>From ₹80</span>
                      </button>
                      <button onClick={() => calculateEstimate('FUEL', 'BIKE')} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '10px', color: 'white', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: '700', fontSize: '13px' }}>Fuel Delivery</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>From ₹150</span>
                      </button>
                      <button onClick={() => calculateEstimate('BATTERY', 'BIKE')} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '10px', color: 'white', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: '700', fontSize: '13px' }}>Battery Jump</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>From ₹150</span>
                      </button>
                      <button onClick={() => calculateEstimate('SPARK_PLUG', 'BIKE')} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '10px', color: 'white', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: '700', fontSize: '13px' }}>Spark Plug</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>From ₹120</span>
                      </button>
                    </div>

                    <h5 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>Services for Car</h5>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <button onClick={() => calculateEstimate('PUNCTURE', 'CAR')} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '10px', color: 'white', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: '700', fontSize: '13px' }}>Flat Tire Change</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>From ₹80</span>
                      </button>
                      <button onClick={() => calculateEstimate('TOWING', 'CAR')} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--glass-border)', padding: '12px', borderRadius: '10px', color: 'white', cursor: 'pointer', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: '700', fontSize: '13px' }}>Car Towing</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>From ₹300</span>
                      </button>
                    </div>
                  </div>
                )}

                {customerStep === 'booking' && (
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                      <button onClick={() => setCustomerStep('home')} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '4px' }}>
                        &larr; Back
                      </button>
                      <h4 style={{ fontSize: '16px', fontWeight: '700' }}>Confirm Request</h4>
                    </div>

                    <div className="glass-card" style={{ padding: '14px', marginBottom: '16px' }}>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Service Type</p>
                      <h5 style={{ fontSize: '15px', fontWeight: '700', marginTop: '2px', color: '#10b981' }}>{selectedService} ({selectedVehicle})</h5>
                      
                      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', alignItems: 'center' }}>
                        <MapPin size={14} color="#ef4444" />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{pickupAddress}</p>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card" style={{ padding: '14px', marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Base service fee</span>
                        <span style={{ fontSize: '13px', color: 'white', fontWeight: '600' }}>₹{priceDetails.basePrice}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Distance charges ({distance} km)</span>
                        <span style={{ fontSize: '13px', color: 'white', fontWeight: '600' }}>₹{priceDetails.distanceCharge}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '10px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: 'white' }}>Total Price</span>
                        <span style={{ fontSize: '16px', fontWeight: '800', color: '#3b82f6' }}>₹{priceDetails.totalPrice}</span>
                      </div>
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Payment Mode</label>
                      <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                        <button 
                          onClick={() => setSelectedPayment('CASH')}
                          style={{ flex: 1, padding: '10px', borderRadius: '6px', border: selectedPayment === 'CASH' ? '1.5px solid #3b82f6' : '1px solid var(--glass-border)', background: selectedPayment === 'CASH' ? 'rgba(59,130,246,0.1)' : 'transparent', color: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                        >
                          Cash / Pay Later
                        </button>
                        <button 
                          onClick={() => setSelectedPayment('ONLINE')}
                          style={{ flex: 1, padding: '10px', borderRadius: '6px', border: selectedPayment === 'ONLINE' ? '1.5px solid #3b82f6' : '1px solid var(--glass-border)', background: selectedPayment === 'ONLINE' ? 'rgba(59,130,246,0.1)' : 'transparent', color: 'white', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                        >
                          Online (Razorpay)
                        </button>
                      </div>
                    </div>

                    <button className="btn-primary" onClick={handleBookNow} style={{ marginTop: 'auto', width: '100%', padding: '14px' }}>
                      Confirm Booking
                    </button>
                  </div>
                )}

                {customerStep === 'searching' && (
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, textAlign: 'center' }}>
                    <div className="ping-container" style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '32px' }}>
                      <div className="ping-circle" style={{ width: '32px', height: '32px', backgroundColor: '#3b82f6' }}>
                        <Wrench size={16} color="white" style={{ position: 'absolute', top: '8px', left: '8px' }} />
                      </div>
                      <div className="ping-ring" style={{ width: '80px', height: '80px', border: '3px solid #3b82f6', animationDuration: '2s' }} />
                    </div>

                    <h4 style={{ fontSize: '18px', fontWeight: '700' }}>Finding Nearby Mechanics...</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '12px', maxWidth: '240px' }}>Notifying Ramesh Puncture Wala (nearest match)... waiting for acceptance.</p>

                    <button 
                      className="btn-danger" 
                      onClick={async () => {
                        try {
                          await fetch(`${BACKEND_URL}/api/orders/${activeOrder.id}/cancel`, { method: 'PATCH' });
                        } catch(e) {}
                        setCustomerStep('home');
                      }}
                      style={{ marginTop: '48px', width: '100%', padding: '10px' }}
                    >
                      Cancel Search
                    </button>
                  </div>
                )}

                {customerStep === 'tracking' && (
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div className="leaflet-map-placeholder" style={{ flex: 1, background: '#111827', position: 'relative' }}>
                      <MapPin size={24} color="#ef4444" style={{ position: 'absolute', top: '40%', left: '50%' }} />
                      {assignedProvider && (
                        <div style={{ position: 'absolute', top: '25%', left: '35%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Navigation size={18} color="#3b82f6" style={{ transform: 'rotate(45deg)' }} />
                          <span style={{ fontSize: '9px', background: '#3b82f6', color: 'white', padding: '2px 4px', borderRadius: '4px', marginTop: '2px' }}>Mechanic</span>
                        </div>
                      )}
                      
                      <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '600' }}>
                        ETA: 8 mins
                      </div>
                    </div>

                    <div className="glass-panel" style={{ padding: '16px', borderRadius: '24px 24px 0 0', borderBottom: 'none' }}>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <img 
                          src={assignedProvider?.profilePhotoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150'} 
                          style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} 
                        />
                        <div style={{ flex: 1 }}>
                          <h5 style={{ fontSize: '14px', fontWeight: '700' }}>{assignedProvider?.name}</h5>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{assignedProvider?.phone}</p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: '700', color: '#f59e0b' }}>
                            <Star size={12} fill="#f59e0b" />
                            {assignedProvider?.rating || '5.0'}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 4px', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Give completion OTP to mechanic:</span>
                        <span style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '2px', color: '#10b981', marginLeft: 'auto' }}>
                          {activeOrder?.otp || '4892'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {customerStep === 'completed' && (
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, justifyItems: 'center', textAlign: 'center' }}>
                    <div style={{ margin: '32px 0' }}>
                      <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto' }} />
                      <h4 style={{ marginTop: '16px', fontSize: '20px', fontWeight: '800' }}>Job Completed!</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '6px' }}>You have settled the payment of ₹{priceDetails.totalPrice}</p>
                    </div>

                    <div className="glass-card" style={{ padding: '16px', margin: '16px 0' }}>
                      <h5 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)', marginBottom: '12px' }}>Rate the service provider</h5>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
                        {[1,2,3,4,5].map((star) => (
                          <button 
                            key={star}
                            onClick={() => setRatingVal(star)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                          >
                            <Star size={24} fill={star <= ratingVal ? '#f59e0b' : 'none'} color="#f59e0b" />
                          </button>
                        ))}
                      </div>
                      <input 
                        type="text" 
                        placeholder="Write a quick review..."
                        value={reviewVal}
                        onChange={(e) => setReviewVal(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)', color: 'white', fontSize: '13px', outline: 'none' }}
                      />
                    </div>

                    <button className="btn-primary" onClick={submitCustomerRating} style={{ marginTop: 'auto', width: '100%' }}>
                      Submit Feedback
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MIDDLE MAP & SYSTEM LOGS */}
          <div className="map-section">
            <div className="map-container-wrapper">
              <div className="leaflet-map-placeholder">
                <Navigation size={32} color="#3b82f6" />
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ fontSize: '16px', fontWeight: '700' }}>Real-time GPS Spatial Mapping</h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', maxWidth: '300px' }}>
                    Visualizing interactive tracking signals. Clicking "Reset DB" reloads active coordinate markers.
                  </p>
                </div>
                
                {/* Visual mini-map rendering coordinates */}
                <div className="glass-card" style={{ width: '80%', padding: '12px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>User Lat/Lng:</span>
                    <span style={{ color: '#ef4444', fontWeight: '600' }}>19.0758, 72.8770</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Mechanic Lat/Lng:</span>
                    <span style={{ color: '#3b82f6', fontWeight: '600' }}>
                      {providerProfile?.currentLat || '19.0760'}, {providerProfile?.currentLng || '72.8777'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="system-logs glass-panel">
              <h3 className="logs-title">
                <span className="ping-container"><span className="ping-circle" /><span className="ping-ring" /></span>
                Socket.io Event Streaming Console
              </h3>
              <div className="logs-box">
                {systemLogs.length === 0 ? (
                  <p style={{ color: '#64748b' }}>Awaiting operational signal packets...</p>
                ) : (
                  systemLogs.map((log, i) => (
                    <div key={i} style={{ marginBottom: '4px' }}>{log}</div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </div>
          </div>

          {/* PROVIDER APP FRAME */}
          <div className="simulator-side">
            <h2 className="logs-title">
              <Smartphone size={16} />
              Provider Mobile App
            </h2>
            <div className="phone-wrapper" style={{ border: '12px solid #334155' }}>
              <div className="phone-notch"><div className="phone-notch-speaker" /></div>

              <div className="phone-content" style={{ backgroundColor: '#0b0f17' }}>
                {providerStep === 'login' && (
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                    <div style={{ textAlign: 'center', margin: '40px 0 20px' }}>
                      <Wrench size={48} color="#10b981" style={{ margin: '0 auto' }} />
                      <h2 style={{ marginTop: '16px', fontSize: '24px', fontWeight: '800' }}>Provider App</h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: '8px' }}>Verified Partner Dashboard</p>
                    </div>

                    <div style={{ marginTop: '24px' }}>
                      <label style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Registered Phone Number</label>
                      <input 
                        type="text" 
                        value={providerPhone}
                        onChange={(e) => setProviderPhone(e.target.value)}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white', marginTop: '6px', fontSize: '14px', outline: 'none' }}
                      />
                    </div>

                    <button className="btn-success" onClick={handleProviderLogin} style={{ marginTop: '32px', width: '100%' }}>
                      Login to Partner Portal
                    </button>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '16px' }}>Default OTP bypass bypasses to Ramesh (General Mechanic).</p>
                  </div>
                )}

                {providerStep === 'home' && (
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Online Partner</span>
                        <h4 style={{ fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                          {providerProfile?.name}
                        </h4>
                      </div>
                      <button onClick={() => setProviderStep('login')} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                        <LogOut size={16} />
                      </button>
                    </div>

                    {/* Online status card */}
                    <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', marginBottom: '16px', background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', flex: 1 }}>Active Duty Status</span>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#10b981', textTransform: 'uppercase' }}>Online</span>
                    </div>

                    {/* Wallet card */}
                    <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', marginBottom: '24px', background: 'linear-gradient(to bottom, rgba(255,255,255,0.02), rgba(0,0,0,0.3))' }}>
                      <Wallet size={32} color="#10b981" style={{ margin: '0 auto 10px' }} />
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Today's Total Wallet Balance</p>
                      <h2 style={{ fontSize: '32px', fontWeight: '800', color: 'white', marginTop: '6px' }}>₹{providerProfile?.walletBalance}</h2>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-around', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: '16px' }}>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Completed</p>
                          <p style={{ fontSize: '15px', fontWeight: '700' }}>{providerProfile?.totalOrders || '0'}</p>
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Commission</p>
                          <p style={{ fontSize: '15px', fontWeight: '700', color: '#f59e0b' }}>20%</p>
                        </div>
                      </div>
                    </div>

                    <div className="glass-card" style={{ padding: '12px', fontSize: '12px' }}>
                      <h5 style={{ fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Registered Skills</h5>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {providerProfile?.skills.map((skill: string) => (
                          <span key={skill} style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.05)', color: 'white', padding: '3px 8px', borderRadius: '4px' }}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Pop-up request modal */}
                    {incomingRequest && (
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div style={{ textAlign: 'center', margin: '40px 0 20px' }}>
                          <AlertTriangle size={48} color="#f59e0b" style={{ margin: '0 auto' }} />
                          <h3 style={{ fontSize: '20px', fontWeight: '800', marginTop: '16px', color: '#f59e0b' }}>Emergency Request!</h3>
                          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '6px' }}>Job will automatically cycle in {countdown} seconds</p>
                        </div>

                        <div className="glass-card" style={{ padding: '16px', margin: '20px 0', border: '1px solid rgba(245,158,11,0.2)' }}>
                          <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Service Required</span>
                          <h4 style={{ fontSize: '16px', fontWeight: '700', marginTop: '2px', color: 'white' }}>{incomingRequest.serviceType}</h4>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px', marginTop: '12px', fontSize: '13px' }}>
                            <span>User distance:</span>
                            <span style={{ fontWeight: '700', color: '#3b82f6' }}>{incomingRequest.distanceKm} KM</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '13px' }}>
                            <span>Your Net Earning:</span>
                            <span style={{ fontWeight: '700', color: '#10b981' }}>₹{incomingRequest.providerEarning}</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
                          <button className="btn-danger" onClick={handleDeclineJob} style={{ flex: 1 }}>
                            Decline
                          </button>
                          <button className="btn-success" onClick={handleAcceptJob} style={{ flex: 2 }}>
                            Accept Job
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {providerStep === 'navigation' && (
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                      <h4 style={{ fontSize: '15px', fontWeight: '700' }}>Navigating to customer</h4>
                    </div>

                    <div className="glass-card" style={{ padding: '14px', marginBottom: '20px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Pickup Location Address</span>
                      <p style={{ fontSize: '13px', fontWeight: '600', marginTop: '4px', color: 'white' }}>{activeOrder?.userAddress}</p>
                    </div>

                    {/* Progress tracking button */}
                    <div className="glass-panel" style={{ padding: '20px', textAlign: 'center', marginBottom: '24px', background: 'rgba(59,130,246,0.05)' }}>
                      <Navigation size={28} color="#3b82f6" style={{ margin: '0 auto 10px', transform: 'rotate(45deg)' }} />
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>En-Route simulation steps</p>
                      
                      <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', marginTop: '12px' }}>
                        {[1,2,3,4].map((stepNum) => (
                          <div 
                            key={stepNum}
                            style={{ width: '40px', height: '6px', borderRadius: '3px', backgroundColor: stepNum <= providerNavProgress ? '#10b981' : 'rgba(255,255,255,0.1)' }}
                          />
                        ))}
                      </div>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
                        {providerNavProgress === 0 && 'Not Departed'}
                        {providerNavProgress === 1 && 'Step 1 of 4: Heading to main road'}
                        {providerNavProgress === 2 && 'Step 2 of 4: Crossing traffic junction'}
                        {providerNavProgress === 3 && 'Step 3 of 4: Entering shopping market area'}
                        {providerNavProgress === 4 && 'Arrived! Flat tire spotted'}
                      </p>
                    </div>

                    <button 
                      className="btn-primary" 
                      onClick={simulateLocationUpdate}
                      disabled={providerNavProgress >= 4}
                      style={{ marginTop: 'auto', width: '100%', padding: '14px', opacity: providerNavProgress >= 4 ? 0.5 : 1 }}
                    >
                      {providerNavProgress === 0 ? 'Start Navigation' : (providerNavProgress >= 3 ? 'Arrive Now' : 'Advance Live Coordinates')}
                    </button>
                  </div>
                )}

                {providerStep === 'in_progress' && (
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1, justifyItems: 'center', textAlign: 'center' }}>
                    <div style={{ margin: '32px 0' }}>
                      <Wrench size={48} color="#10b981" style={{ margin: '0 auto' }} />
                      <h4 style={{ marginTop: '16px', fontSize: '18px', fontWeight: '800' }}>Service In Progress</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '6px' }}>Fixing flat tire/flatbed towing... collect 4-digit OTP from user once complete.</p>
                    </div>

                    <div className="glass-card" style={{ padding: '20px', margin: '20px 0' }}>
                      <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                        Enter Order Completion OTP
                      </label>
                      <input 
                        type="text" 
                        maxLength={6}
                        placeholder="e.g. 4892"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1.5px solid var(--glass-border)', background: 'rgba(0,0,0,0.3)', color: 'white', fontSize: '20px', fontWeight: '800', textAlign: 'center', letterSpacing: '4px', outline: 'none' }}
                      />
                    </div>

                    <button className="btn-success" onClick={handleJobCompletion} style={{ marginTop: 'auto', width: '100%', padding: '14px' }}>
                      Verify & Complete Job
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ADMIN DASHBOARD */
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 70px)', overflowY: 'auto' }}>
          
          {/* Sub Navbar for Admin Panels */}
          <div className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={18} color="#3b82f6" />
              Administrative Operations Portal
            </h3>
            
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <button 
                onClick={() => setAdminSubTab('overview')} 
                style={{ background: adminSubTab === 'overview' ? '#3b82f6' : 'transparent', color: adminSubTab === 'overview' ? 'white' : 'var(--text-secondary)', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}
              >
                Overview
              </button>
              <button 
                onClick={() => setAdminSubTab('onboarding')} 
                style={{ background: adminSubTab === 'onboarding' ? '#3b82f6' : 'transparent', color: adminSubTab === 'onboarding' ? 'white' : 'var(--text-secondary)', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}
              >
                Provider Onboarding
              </button>
              <button 
                onClick={() => setAdminSubTab('orders')} 
                style={{ background: adminSubTab === 'orders' ? '#3b82f6' : 'transparent', color: adminSubTab === 'orders' ? 'white' : 'var(--text-secondary)', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}
              >
                All Orders Logs
              </button>
              <button 
                onClick={() => setAdminSubTab('pricing')} 
                style={{ background: adminSubTab === 'pricing' ? '#3b82f6' : 'transparent', color: adminSubTab === 'pricing' ? 'white' : 'var(--text-secondary)', border: 'none', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s' }}
              >
                Pricing Settings
              </button>
            </div>
          </div>

          {/* OVERVIEW TAB */}
          {adminSubTab === 'overview' && (
            <div className="admin-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', padding: 0, height: 'auto', overflowY: 'visible' }}>
              
              {/* Dynamic Stats blocks */}
              <div className="metric-card glass-panel" style={{ padding: '20px' }}>
                <div className="metric-details">
                  <h3>Platform Cut Earnings (20%)</h3>
                  <p>₹{ordersList.filter(o => o.status === 'COMPLETED').reduce((acc, curr) => acc + Number(curr.platformCommission || 0), 0).toFixed(2)}</p>
                </div>
                <div className="metric-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                  <TrendingUp size={24} />
                </div>
              </div>

              <div className="metric-card glass-panel" style={{ padding: '20px' }}>
                <div className="metric-details">
                  <h3>Completed Orders</h3>
                  <p>{ordersList.filter(o => o.status === 'COMPLETED').length}</p>
                </div>
                <div className="metric-icon" style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>
                  <CheckCircle size={24} />
                </div>
              </div>

              <div className="metric-card glass-panel" style={{ padding: '20px' }}>
                <div className="metric-details">
                  <h3>Verified Mechanics</h3>
                  <p>{providers.filter(p => p.isVerified).length} / {providers.length}</p>
                </div>
                <div className="metric-icon" style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                  <UserCheck size={24} />
                </div>
              </div>

              <div className="metric-card glass-panel" style={{ padding: '20px' }}>
                <div className="metric-details">
                  <h3>Pending Verify Queue</h3>
                  <p>{providers.filter(p => !p.isVerified).length}</p>
                </div>
                <div className="metric-icon" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>
                  <User size={24} />
                </div>
              </div>

              {/* AREA REVENUE DETAILS CHART */}
              <div className="chart-card glass-panel" style={{ gridColumn: 'span 3', padding: '20px' }}>
                <h4 className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Gross Platform Revenue Breakdown (₹)</span>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>Platform Cut (20%) vs Partner Net (80%)</span>
                </h4>
                <div style={{ width: '100%', height: '240px' }}>
                  <ResponsiveContainer width="99%" height="100%">
                    <AreaChart data={[
                      { name: 'Trip 1', total: 88, platform: 17.6, partner: 70.4 },
                      { name: 'Trip 2', total: 172.5, platform: 34.5, partner: 138 },
                      { name: 'Trip 3', total: 92, platform: 18.4, partner: 73.6 },
                      { name: 'Trip 4', total: 235, platform: 47, partner: 188 },
                      { 
                        name: 'Live Net', 
                        total: ordersList.reduce((acc, curr) => acc + Number(curr.totalPrice || 0), 0),
                        platform: ordersList.reduce((acc, curr) => acc + Number(curr.platformCommission || 0), 0),
                        partner: ordersList.reduce((acc, curr) => acc + Number(curr.providerEarning || 0), 0)
                      }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="var(--text-secondary)" style={{ fontSize: '10px' }} />
                      <YAxis stroke="var(--text-secondary)" style={{ fontSize: '10px' }} />
                      <Tooltip contentStyle={{ background: '#0b0f19', border: '1px solid var(--glass-border)', color: 'white' }} />
                      <Area type="monotone" dataKey="total" stroke="#f59e0b" fill="rgba(245,158,11,0.04)" strokeWidth={2} name="Grand Total Payout" />
                      <Area type="monotone" dataKey="platform" stroke="#3b82f6" fill="rgba(59,130,246,0.04)" strokeWidth={2} name="Platform Commission" />
                      <Area type="monotone" dataKey="partner" stroke="#10b981" fill="rgba(16,185,129,0.04)" strokeWidth={2} name="Partner Share" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* DEMOGRAPHICS DISTRIBUTION */}
              <div className="pie-card glass-panel" style={{ gridColumn: 'span 1', padding: '20px' }}>
                <h4 className="card-title">Incident Category distribution</h4>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1 }}>
                  <ResponsiveContainer width="100%" height={150}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Puncture', value: ordersList.filter(o => o.serviceType === 'PUNCTURE').length || 1, color: '#3b82f6' },
                          { name: 'Battery', value: ordersList.filter(o => o.serviceType === 'BATTERY').length || 1, color: '#f59e0b' },
                          { name: 'Fuel Delivery', value: ordersList.filter(o => o.serviceType === 'FUEL').length || 1, color: '#10b981' },
                          { name: 'Towing', value: ordersList.filter(o => o.serviceType === 'TOWING').length || 1, color: '#ef4444' }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={65}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#f59e0b" />
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '10px', width: '100%', marginTop: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3b82f6' }} />Puncture</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />Battery</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />Fuel</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ef4444' }} />Towing</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PROVIDER ONBOARDING DOCUMENT VERIFICATION */}
          {adminSubTab === 'onboarding' && (
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: '700' }}>Mechanic Registry & Document Verification Queue</h4>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Review submitted Aadhar Cards and Driving Licenses to onboard partners.</span>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--text-secondary)' }}>Mechanic Name</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--text-secondary)' }}>Skills / Services</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px', color: 'var(--text-secondary)' }}>Documents Registry</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>Status Badge</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '11px', color: 'var(--text-secondary)' }}>Onboarding Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {providers.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '16px 12px' }}>
                          <span style={{ color: 'white', fontWeight: '700', fontSize: '14px' }}>{p.name}</span>
                          <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Phone: {p.phone}</span>
                        </td>
                        <td style={{ padding: '16px 12px' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {p.skills.map((sk: string) => (
                              <span key={sk} style={{ fontSize: '10px', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                {sk}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '16px 12px', fontSize: '12px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <span>💳 Aadhar: <strong style={{ color: 'white' }}>{p.aadharNumber || 'Pending'}</strong></span>
                            <span>🪪 License: <strong style={{ color: 'white' }}>{p.licenseNumber || 'Pending'}</strong></span>
                            <span>🛡️ Insurance: <strong style={{ color: 'white' }}>{p.insuranceCode || 'Pending'}</strong></span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                          <span className={p.isVerified ? 'badge badge-success' : 'badge badge-pending'}>
                            {p.isVerified ? 'VERIFIED' : 'PENDING REVIEW'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                            {!p.isVerified ? (
                              <button 
                                onClick={() => {
                                  setProviders(prev => prev.map(item => item.id === p.id ? { ...item, isVerified: true } : item));
                                  addLog(`[Admin] Onboarded & verified provider: ${p.name}`);
                                  alert(`Onboarding Approved: ${p.name} document credentials successfully verified and onboarded dynamically!`);
                                }} 
                                style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                              >
                                Approve Verify
                              </button>
                            ) : (
                              <button 
                                onClick={() => {
                                  setProviders(prev => prev.map(item => item.id === p.id ? { ...item, isVerified: false } : item));
                                  addLog(`[Admin] De-authorized provider verification: ${p.name}`);
                                  alert(`Provider Suspended: ${p.name} verification status suspended and blocked from sweeps.`);
                                }} 
                                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}
                              >
                                Suspend/Revoke
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ALL ORDERS LOG DETAILS VIEW WITH FILTERS */}
          {adminSubTab === 'orders' && (
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700' }}>Overall Bookings & Orders Transactions Logs</h4>
                  <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Track live booking pings, dispatch coefficients, and client reviews.</p>
                </div>
                
                {/* Dynamic status filters */}
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Filter size={12} />
                    Filter status:
                  </span>
                  <select 
                    value={ordersFilter}
                    onChange={(e) => setOrdersFilter(e.target.value)}
                    style={{ background: '#131a2b', border: '1px solid var(--glass-border)', color: 'white', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', outline: 'none' }}
                  >
                    <option value="ALL">ALL ORDERS</option>
                    <option value="ACCEPTED">ACCEPTED / EN-ROUTE</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px' }}>Order ID</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px' }}>Customer Name</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px' }}>Incident Detail</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px' }}>Invoice Split</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '11px' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px' }}>Stars / Reviews</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ordersList
                      .filter((o) => ordersFilter === 'ALL' || o.status === ordersFilter)
                      .map((o) => (
                        <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '16px 12px', color: '#60a5fa', fontWeight: '700', fontSize: '13px' }}>{o.id}</td>
                          <td style={{ padding: '16px 12px' }}>
                            <span style={{ color: 'white', fontWeight: '600' }}>{o.customerName}</span>
                            <span style={{ display: 'block', fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Mode: {o.paymentMethod}</span>
                          </td>
                          <td style={{ padding: '16px 12px' }}>
                            <span style={{ color: 'white', fontWeight: '600', fontSize: '13px' }}>🛠️ {o.serviceType} ({o.vehicleType})</span>
                            <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginTop: '2px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                              📍 {o.userAddress}
                            </span>
                          </td>
                          <td style={{ padding: '16px 12px', fontSize: '12px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <span>Gross: <strong style={{ color: 'white' }}>₹{Number(o.totalPrice).toFixed(2)}</strong></span>
                              <span>Commission: <strong style={{ color: '#ef4444' }}>-₹{Number(o.platformCommission).toFixed(2)}</strong></span>
                              <span>Partner Share: <strong style={{ color: '#10b981' }}>+₹{Number(o.providerEarning).toFixed(2)}</strong></span>
                            </div>
                          </td>
                          <td style={{ padding: '16px 12px', textAlign: 'center' }}>
                            <span className={
                              o.status === 'COMPLETED' ? 'badge badge-success' :
                              o.status === 'CANCELLED' ? 'badge badge-error' : 'badge badge-info'
                            }>
                              {o.status}
                            </span>
                          </td>
                          <td style={{ padding: '16px 12px' }}>
                            {o.rating ? (
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#f59e0b', fontSize: '12px', fontWeight: '700' }}>
                                  {[...Array(o.rating)].map((_, i) => <Star key={i} size={10} fill="#f59e0b" color="#f59e0b" />)}
                                </div>
                                <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', marginTop: '4px', maxWidth: '180px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                  "{o.review}"
                                </span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '11px', color: '#64748b' }}>Awaiting rating stars...</span>
                            )}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PRICING COEFFICIENTS CONFIGURATION PANEL */}
          {adminSubTab === 'pricing' && (
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '700' }}>Pricing Model Coefficients Settings</h4>
                  <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Modify base rates and per-km distances pricing coefficients, immediately updating simulator quotes.</p>
                </div>
                
                <button 
                  onClick={() => {
                    alert('Coefficients Saved: Pricing model coefficients successfully updated in memory and linked to simulator!');
                  }}
                  className="btn-success"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', padding: '8px 16px' }}
                >
                  <Check size={14} />
                  Save Settings
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px' }}>Roadside Problem</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '11px' }}>Base Fee (₹)</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '11px' }}>Bike Rate/KM (₹)</th>
                      <th style={{ padding: '12px', textAlign: 'center', fontSize: '11px' }}>Car Rate/KM (₹)</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontSize: '11px' }}>Fare Estimates Mockup (2.5 KM)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(pricingConfig).map((key) => {
                      const config = pricingConfig[key];
                      return (
                        <tr key={key} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '14px 12px', color: 'white', fontWeight: '700', fontSize: '13px' }}>
                            🛠️ {key}
                          </td>
                          <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                            <input 
                              type="number"
                              value={config.base}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setPricingConfig((prev: any) => ({
                                  ...prev,
                                  [key]: { ...prev[key], base: val }
                                }));
                              }}
                              style={{ width: '80px', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.08)', color: 'white', padding: '6px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: '700', textAlign: 'center', outline: 'none' }}
                            />
                          </td>
                          <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                            <input 
                              type="number"
                              value={config.perKmBike}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setPricingConfig((prev: any) => ({
                                  ...prev,
                                  [key]: { ...prev[key], perKmBike: val }
                                }));
                              }}
                              style={{ width: '70px', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.08)', color: 'white', padding: '6px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: '700', textAlign: 'center', outline: 'none' }}
                            />
                          </td>
                          <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                            <input 
                              type="number"
                              value={config.perKmCar}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setPricingConfig((prev: any) => ({
                                  ...prev,
                                  [key]: { ...prev[key], perKmCar: val }
                                }));
                              }}
                              style={{ width: '70px', background: '#0b0f19', border: '1px solid rgba(255,255,255,0.08)', color: 'white', padding: '6px 8px', borderRadius: '4px', fontSize: '13px', fontWeight: '700', textAlign: 'center', outline: 'none' }}
                            />
                          </td>
                          <td style={{ padding: '14px 12px', fontSize: '12px', color: '#94a3b8' }}>
                            <span>🏍️ Bike: <strong>₹{config.base + (2.5 * config.perKmBike)}</strong></span>
                            <span style={{ marginLeft: '12px' }}>🚗 Car: <strong>₹{config.base + (2.5 * config.perKmCar)}</strong></span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
        </div>
      )}
    </div>
  );
}
