/**
 * Dashboard Page
 * Main dashboard with carbon score, charts, and goal progress
 * Updated with Earth Health Meter, CO2 translator, and improved UI/UX
 */

import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../services/api';
import { DashboardSummary } from '@cft/shared';
import { TipsSection } from '../components/tips/TipsSection';
import { EarthHealthMeter } from '../components/common/EarthHealthMeter';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { EmptyState } from '../components/common/EmptyState';
import { getPrimaryComparison } from '../utils/co2Translator';

const COLORS = {
  transport: '#3b82f6',
  food: '#10b981',
  energy: '#f59e0b',
  shopping: '#8b5cf6',
};

const CATEGORY_LABELS = {
  transport: 'Transport',
  food: 'Food',
  energy: 'Energy',
  shopping: 'Shopping',
};

export function Dashboard() {
  const { currentUser, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null);
  const [selectedRange, setSelectedRange] = useState<'week' | 'month'>('week');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkQuizStatus = async () => {
      if (!currentUser) return;

      try {
        // Fetch quiz status from backend (avoids direct Firestore dependency in browser)
        const response = await api.get<{ quizCompleted: boolean }>('/user/profile');
        if (response.success && response.data?.quizCompleted) {
          setQuizCompleted(true);
        } else {
          navigate('/quiz');
        }
      } catch (error) {
        console.error('Error checking quiz status:', error);
        setError('Failed to connect. Please check your network and try again.');
      } finally {
        setLoading(false);
      }
    };

    checkQuizStatus();
  }, [currentUser, navigate]);

  const loadDashboardData = async () => {
    try {
      setError(null);
      const response = await api.getDashboardSummary(selectedRange);
      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError('Failed to load dashboard data');
    }
  };

  useEffect(() => {
    if (quizCompleted) {
      loadDashboardData();
    }
  }, [selectedRange, quizCompleted]);

  async function handleLogout() {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading your dashboard..." />;
  }

  if (!quizCompleted) {
    return null;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorMessage message={error} onRetry={loadDashboardData} />
      </div>
    );
  }

  // Empty state for new users
  if (dashboardData && !dashboardData.hasData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900">Dashboard</h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors"
            >
              Log Out
            </button>
          </div>

          {/* Welcome Card */}
          <div className="bg-white border-2 border-primary-200 rounded-2xl p-8 sm:p-12 shadow-soft mb-8">
            <EmptyState
              icon="🌱"
              title="Welcome to Your Carbon Journey!"
              description="You've completed your baseline assessment. Now it's time to start tracking your daily activities to see your real carbon footprint and make positive changes."
              actionLabel="📝 Log Your First Activity"
              onAction={() => navigate('/log-activity')}
            />
            
            <div className="mt-8 bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-6 max-w-md mx-auto">
              <div className="text-sm text-neutral-600 mb-2 text-center">Your Baseline Score</div>
              <div className="text-5xl font-bold text-primary-600 mb-2 text-center">
                {dashboardData.goalProgress.baselineScore}
              </div>
              <div className="text-sm text-neutral-500 text-center">
                Higher is better • 0-100 scale
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-soft border border-neutral-200">
              <div className="text-4xl mb-3">🚗</div>
              <h3 className="font-semibold text-neutral-900 mb-2">Track Transport</h3>
              <p className="text-sm text-neutral-600">
                Log your daily commute, car trips, flights, and public transport usage
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-soft border border-neutral-200">
              <div className="text-4xl mb-3">🍽️</div>
              <h3 className="font-semibold text-neutral-900 mb-2">Monitor Food</h3>
              <p className="text-sm text-neutral-600">
                Track your meals and food choices to understand their carbon impact
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-soft border border-neutral-200">
              <div className="text-4xl mb-3">⚡</div>
              <h3 className="font-semibold text-neutral-900 mb-2">Measure Energy</h3>
              <p className="text-sm text-neutral-600">
                Log your electricity, heating, and cooling usage at home
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  // Prepare chart data
  const categoryChartData = dashboardData.categoryBreakdown.map(item => ({
    name: CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS],
    value: item.co2Kg,
    percentage: item.percentage,
  }));

  const dailyChartData = dashboardData.dailyTotals.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    total: parseFloat(day.total.toFixed(2)),
    transport: parseFloat(day.byCategory.transport?.toFixed(2) || '0'),
    food: parseFloat(day.byCategory.food?.toFixed(2) || '0'),
    energy: parseFloat(day.byCategory.energy?.toFixed(2) || '0'),
    shopping: parseFloat(day.byCategory.shopping?.toFixed(2) || '0'),
  }));

  const { goalProgress } = dashboardData;

  // Get CO2 comparison
  const totalComparison = getPrimaryComparison(dashboardData.totalCO2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900">Dashboard</h1>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/log-activity')}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium shadow-md"
            >
              📝 Log Activity
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-neutral-200 text-neutral-700 rounded-lg hover:bg-neutral-300 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Range Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setSelectedRange('week')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedRange === 'week'
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setSelectedRange('month')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedRange === 'month'
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-white text-neutral-700 hover:bg-neutral-100'
            }`}
          >
            Month
          </button>
        </div>

        {/* Earth Health Meter */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 mb-6 shadow-soft border border-neutral-200">
          <EarthHealthMeter
            score={goalProgress.currentScore}
            baselineScore={goalProgress.baselineScore}
            size="lg"
          />
        </div>

        {/* Goal Progress */}
        {goalProgress.goalTarget !== undefined && goalProgress.progressTowardGoal !== undefined && (
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-soft border border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">🎯 Your Goal Progress</h2>
            <div className="mb-2 flex justify-between text-sm text-neutral-600">
              <span>Target: {goalProgress.goalTarget}% reduction</span>
              <span className="font-medium text-primary-600">
                {goalProgress.progressTowardGoal.toFixed(1)}% achieved
              </span>
            </div>
            <div className="w-full bg-neutral-200 rounded-full h-4 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary-500 to-primary-600 h-4 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, goalProgress.progressTowardGoal)}%` }}
              />
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-200">
            <div className="text-sm text-neutral-600 mb-1">Total CO₂</div>
            <div className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">
              {dashboardData.totalCO2.toFixed(1)} kg
            </div>
            <div className="text-sm text-primary-600 flex items-center gap-1">
              <span>{totalComparison.icon}</span>
              <span>≈ {totalComparison.value} {totalComparison.description}</span>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-200">
            <div className="text-sm text-neutral-600 mb-1">Period</div>
            <div className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-2 capitalize">
              {dashboardData.period.range}
            </div>
            <div className="text-sm text-neutral-500">
              {new Date(dashboardData.period.startDate).toLocaleDateString()} - 
              {new Date(dashboardData.period.endDate).toLocaleDateString()}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-200 sm:col-span-2 lg:col-span-1">
            <div className="text-sm text-neutral-600 mb-1">Daily Average</div>
            <div className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-2">
              {(dashboardData.totalCO2 / dashboardData.dailyTotals.length).toFixed(1)} kg
            </div>
            <div className="text-sm text-neutral-500">per day</div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Daily Totals Line Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">📈 Daily CO₂ Emissions</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" label={{ value: 'kg CO₂e', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="total" stroke="#22c55e" strokeWidth={3} name="Total" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown Pie Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-200">
            <h2 className="text-lg font-semibold text-neutral-900 mb-4">🥧 Category Breakdown</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryChartData.map((_entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[dashboardData.categoryBreakdown[index].category as keyof typeof COLORS]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stacked Bar Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-200 mb-6">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">📊 Daily Breakdown by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" label={{ value: 'kg CO₂e', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="transport" stackId="a" fill={COLORS.transport} name="Transport" />
              <Bar dataKey="food" stackId="a" fill={COLORS.food} name="Food" />
              <Bar dataKey="energy" stackId="a" fill={COLORS.energy} name="Energy" />
              <Bar dataKey="shopping" stackId="a" fill={COLORS.shopping} name="Shopping" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tips Section */}
        <div className="mb-6">
          <TipsSection />
        </div>

        {/* Category Details */}
        <div className="bg-white rounded-2xl p-6 shadow-soft border border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900 mb-4">📋 Category Details</h2>
          <div className="space-y-4">
            {dashboardData.categoryBreakdown.map((item) => {
              const comparison = getPrimaryComparison(item.co2Kg);
              return (
                <div key={item.category} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-neutral-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded flex-shrink-0"
                      style={{ backgroundColor: COLORS[item.category as keyof typeof COLORS] }}
                    />
                    <span className="font-medium text-neutral-900">
                      {CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS]}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                    <span className="text-neutral-600">{item.co2Kg.toFixed(2)} kg CO₂e</span>
                    <span className="text-sm text-primary-600">
                      {comparison.icon} ≈ {comparison.value} {comparison.description}
                    </span>
                    <span className="text-sm text-neutral-500 sm:w-16 sm:text-right">{item.percentage}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob
