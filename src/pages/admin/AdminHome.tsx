import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Package, 
  Store,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Calendar
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { useAppContext } from '../../context/AppContext';
import { FirestoreService } from '../../services/FirestoreService';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const AdminHome: React.FC = () => {
  const { formatPrice, language, theme } = useAppContext();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    totalSuppliers: 0,
    pendingSuppliers: 0,
    recentOrders: [] as any[],
    allOrders: [] as any[]
  });
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const orders = await FirestoreService.getCollection('orders') as any[];
      const users = await FirestoreService.getCollection('users') as any[];
      const products = await FirestoreService.getCollection('products') as any[];
      const suppliers = await FirestoreService.getCollection('suppliers') as any[];
      
      setStats(prev => ({
        ...prev,
        totalUsers: users.length,
        totalProducts: products.length,
        totalSuppliers: suppliers.length,
        pendingSuppliers: suppliers.filter(s => s.status === 'pending').length,
        allOrders: orders,
        recentOrders: [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
      }));

      processStats(orders, timeRange);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const processStats = (orders: any[], range: 'day' | 'week' | 'month') => {
    const now = new Date();
    let startDate = new Date();
    
    if (range === 'day') startDate.setHours(now.getHours() - 24);
    else if (range === 'week') startDate.setDate(now.getDate() - 7);
    else if (range === 'month') startDate.setDate(now.getDate() - 30);

    const filteredOrders = orders.filter(order => new Date(order.createdAt) >= startDate);
    const sales = filteredOrders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);

    setStats(prev => ({
      ...prev,
      totalSales: sales,
      totalOrders: filteredOrders.length,
    }));

    // Generate Chart Data
    const data: any[] = [];
    if (range === 'day') {
      // Last 24 hours
      for (let i = 23; i >= 0; i--) {
        const d = new Date();
        d.setHours(now.getHours() - i);
        const label = d.getHours() + ':00';
        const hourlySales = filteredOrders
          .filter(o => {
            const od = new Date(o.createdAt);
            return od.getHours() === d.getHours() && od.getDate() === d.getDate();
          })
          .reduce((acc, o) => acc + (o.totalPrice || 0), 0);
        data.push({ name: label, sales: hourlySales });
      }
    } else {
      // Last 7 or 30 days
      const days = range === 'week' ? 7 : 30;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const label = d.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short', day: 'numeric' });
        const dailySales = filteredOrders
          .filter(o => {
            const od = new Date(o.createdAt);
            return od.getDate() === d.getDate() && od.getMonth() === d.getMonth();
          })
          .reduce((acc, o) => acc + (o.totalPrice || 0), 0);
        data.push({ name: label, sales: dailySales });
      }
    }
    setChartData(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (stats.allOrders.length > 0) {
      processStats(stats.allOrders, timeRange);
    }
  }, [timeRange]);

  const statCards = [
    { label: t('admin.stats.totalRevenue'), value: formatPrice(stats.totalSales), icon: TrendingUp, trend: '+12.5%', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: t('admin.stats.totalOrders'), value: stats.totalOrders, icon: ShoppingBag, trend: '+8.2%', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: t('admin.stats.activeUsers'), value: stats.totalUsers, icon: Users, trend: '+5.1%', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: t('admin.suppliers'), value: `${stats.totalSuppliers} (${stats.pendingSuppliers} ${t('admin.stats.pending')})`, icon: Store, trend: 'New', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  ];

  const getDateRangeLabel = () => {
    const now = new Date();
    let start = new Date();
    if (timeRange === 'day') start.setHours(now.getHours() - 24);
    else if (timeRange === 'week') start.setDate(now.getDate() - 7);
    else if (timeRange === 'month') start.setDate(now.getDate() - 30);

    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    return `${start.toLocaleDateString(locale, options)} - ${now.toLocaleDateString(locale, { ...options, year: 'numeric' })}`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-velmora-900 dark:text-white">{t('admin.dashboard')}</h1>
          <p className="text-velmora-500 dark:text-velmora-400 text-sm mt-1">
            {t('admin.trackManage')}
          </p>
        </div>
        <div className="flex items-center space-x-1 bg-white dark:bg-velmora-900 p-1 rounded-xl border border-velmora-200 dark:border-white/5 shadow-sm rtl:space-x-reverse">
          {(['day', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${
                timeRange === range 
                  ? 'bg-velmora-900 text-white rounded-lg shadow-lg shadow-velmora-900/20' 
                  : 'text-velmora-500 dark:text-velmora-400 hover:text-velmora-900 dark:hover:text-white'
              }`}
            >
              {t(`${range}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-velmora-900 p-6 rounded-3xl border border-velmora-200 dark:border-white/5 shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-colors group-hover:bg-opacity-80`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="flex items-center space-x-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg text-[10px] font-bold rtl:space-x-reverse">
                <ArrowUpRight className="w-3 h-3" />
                <span>{stat.trend}</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-velmora-400 dark:text-velmora-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-velmora-900 dark:text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-velmora-900 p-8 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-velmora-900/20">
        <div className="space-y-2 text-center md:text-left rtl:md:text-right">
          <h2 className="text-2xl font-display font-bold">{t('QUICK ACTIONS') || 'Quick Actions'}</h2>
          <p className="text-white/60 text-sm">{t('QUICK ACTIONS DESC') || 'Manage your store efficiently with these shortcuts.'}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={() => navigate('/admin/products')}
            className="bg-white dark:bg-velmora-100 text-black dark:text-velmora-900 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-velmora-50 dark:hover:bg-white transition-all flex items-center gap-2"
          >
            <Package size={16} />
            {t('ADD PRODUCT') || 'Add Product'}
          </button>
          <button 
            onClick={() => navigate('/admin/orders')}
            className="bg-white/10 text-white border border-white/20 px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2"
          >
            <ShoppingBag size={16} />
            {t('VIEW ORDERS') || 'View Orders'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-velmora-900 p-8 rounded-3xl border border-velmora-200 dark:border-white/5 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h2 className="text-xl font-display font-bold text-velmora-900 dark:text-white">{t('admin.stats.totalRevenue')}</h2>
              <p className="text-velmora-500 dark:text-velmora-400 text-xs mt-1">
                {t('TOTAL REVENUE CHART', { range: t(`admin.stats.${timeRange}`) })}
              </p>
            </div>
            <div className="flex items-center space-x-2 text-velmora-400 dark:text-velmora-500 text-xs font-medium rtl:space-x-reverse">
              <Calendar className="w-4 h-4" />
              <span>{getDateRangeLabel()}</span>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={theme === 'dark' ? '#fff' : '#1a160f'} stopOpacity={0.1}/>
                    <stop offset="95%" stopColor={theme === 'dark' ? '#fff' : '#1a160f'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#333' : '#eee7d7'} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: theme === 'dark' ? '#888' : '#9c7e41', fontSize: 10 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: theme === 'dark' ? '#888' : '#9c7e41', fontSize: 10 }}
                  tickFormatter={(value) => value >= 1000 ? `${value/1000}k` : value}
                  orientation={language === 'ar' ? 'right' : 'left'}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? '#1a160f' : '#fdfbf7', 
                    border: theme === 'dark' ? '1px solid #333' : '1px solid #eee7d7', 
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                  itemStyle={{ color: theme === 'dark' ? '#fff' : '#1a160f' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke={theme === 'dark' ? '#fff' : '#1a160f'} 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-velmora-900 p-8 rounded-3xl border border-velmora-200 dark:border-white/5 shadow-sm">
          <h2 className="text-xl font-display font-bold text-velmora-900 dark:text-white mb-6">{t('Orders')}</h2>
          <div className="space-y-6">
            {stats.recentOrders.map((order, i) => (
              <div key={order.id} className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center space-x-4 rtl:space-x-reverse">
                  <div className="w-10 h-10 bg-velmora-50 dark:bg-velmora-800 rounded-xl flex items-center justify-center border border-velmora-100 dark:border-white/5 group-hover:bg-velmora-100 dark:group-hover:bg-white/10 transition-colors">
                    <ShoppingBag className="w-5 h-5 text-velmora-400 dark:text-velmora-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-velmora-900 dark:text-white">#{order.id?.slice(-6).toUpperCase()}</p>
                    <p className="text-[10px] text-velmora-500 dark:text-velmora-400 uppercase tracking-widest font-bold">{order.email?.split('@')[0]}</p>
                  </div>
                </div>
                <div className="text-right rtl:text-left">
                  <p className="text-sm font-bold text-velmora-900 dark:text-white">{formatPrice(order.totalPrice)}</p>
                  <p className={`text-[10px] uppercase tracking-widest font-bold ${
                    order.status === 'completed' ? 'text-emerald-600' : 'text-orange-600'
                  }`}>
                    {t(`orders.statuses.${order.status}`)}
                  </p>
                </div>
              </div>
            ))}
            {stats.recentOrders.length === 0 && (
              <div className="text-center py-12 text-velmora-400 dark:text-velmora-600">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-sm font-medium">{t('admin.noOrders') || 'No recent orders'}</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => navigate('/admin/orders')}
            className="w-full mt-8 py-3 text-xs font-bold uppercase tracking-widest text-velmora-500 dark:text-velmora-400 hover:text-velmora-900 dark:hover:text-white hover:bg-velmora-50 dark:hover:bg-white/5 rounded-xl transition-all border border-dashed border-velmora-200 dark:border-white/10"
          >
            {t('common.viewAll')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;
