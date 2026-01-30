import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import WellnessWidget from "../components/WellnessWidget";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, RadialBarChart, RadialBar, Legend
} from "recharts";

const COLORS = ['#14b8a6', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4'];

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-900/95 backdrop-blur-xl border border-white/10 rounded-xl p-3 shadow-lg">
        <p className="text-white text-sm font-medium">{label}</p>
        <p className="text-primary-400 text-sm">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

// Stat Card
const StatCard = ({ icon, value, label, subtitle, color = "primary" }) => {
  const colorClasses = {
    primary: "from-primary-500/20 to-primary-600/10 border-primary-500/30",
    accent: "from-accent-500/20 to-accent-600/10 border-accent-500/30",
    purple: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
    blue: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-5 rounded-xl bg-gradient-to-br ${colorClasses[color]} border`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          <p className="text-sm text-white/60">{label}</p>
          {subtitle && <p className="text-xs text-white/40 mt-1">{subtitle}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </motion.div>
  );
};

// BMI Gauge Component
const BMIGauge = ({ bmi }) => {
  const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { label: "Underweight", color: "#60a5fa" };
    if (bmi < 25) return { label: "Normal", color: "#22c55e" };
    if (bmi < 30) return { label: "Overweight", color: "#f59e0b" };
    return { label: "Obese", color: "#ef4444" };
  };

  const category = getBMICategory(bmi);
  const percentage = Math.min((bmi / 40) * 100, 100);

  return (
    <div className="text-center">
      <div className="relative w-32 h-32 mx-auto">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="12"
            fill="none"
          />
          <circle
            cx="64"
            cy="64"
            r="56"
            stroke={category.color}
            strokeWidth="12"
            fill="none"
            strokeDasharray={`${percentage * 3.52} 352`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{bmi}</span>
          <span className="text-xs text-white/50">BMI</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium" style={{ color: category.color }}>
        {category.label}
      </p>
    </div>
  );
};

// Member Health Card
const MemberHealthCard = ({ member, plansCount }) => {
  const bmi = member.height && member.weight 
    ? (member.weight / Math.pow(member.height / 100, 2)).toFixed(1)
    : null;

  const idealWeight = member.height 
    ? ((member.height - 100) * 0.9).toFixed(0)
    : null;

  const weightDiff = idealWeight && member.weight
    ? (member.weight - idealWeight).toFixed(1)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-5"
    >
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-2xl flex-shrink-0">
          {member.gender === 'Male' ? '👨' : '👩'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{member.fullName}</h3>
          <p className="text-sm text-white/50">{member.age} years • {member.gender}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="px-2 py-1 rounded-lg bg-white/5 text-xs text-white/70">
              {member.height} cm
            </span>
            <span className="px-2 py-1 rounded-lg bg-white/5 text-xs text-white/70">
              {member.weight} kg
            </span>
            {plansCount > 0 && (
              <span className="px-2 py-1 rounded-lg bg-primary-500/20 text-xs text-primary-300">
                {plansCount} plans
              </span>
            )}
          </div>
        </div>
      </div>

      {bmi && (
        <div className="mt-4 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <BMIGauge bmi={parseFloat(bmi)} />
            <div className="text-right">
              <p className="text-xs text-white/40 mb-1">Ideal Weight Range</p>
              <p className="text-lg font-semibold text-white">{idealWeight} kg</p>
              {weightDiff && (
                <p className={`text-xs ${parseFloat(weightDiff) > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                  {parseFloat(weightDiff) > 0 ? `+${weightDiff}` : weightDiff} kg
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [stats, setStats] = useState(null);
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    async function fetchData() {
      if (!currentUser?.uid) return;

      try {
        const [familyRes, statsRes, plansRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/family/family?userId=${currentUser.uid}`),
          axios.get(`http://localhost:5000/api/plan/stats/${currentUser.uid}`),
          axios.get(`http://localhost:5000/api/plan/user/${currentUser.uid}`)
        ]);

        setFamilyMembers(familyRes.data.family || []);
        setStats(statsRes.data);
        setPlans(plansRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
      setLoading(false);
    }

    fetchData();
  }, [currentUser]);

  // Prepare chart data
  const goalChartData = stats?.goalDistribution 
    ? Object.entries(stats.goalDistribution).map(([name, value]) => ({ name: name.split(' ')[0], value }))
    : [];

  const dietChartData = stats?.dietDistribution
    ? Object.entries(stats.dietDistribution).map(([name, value]) => ({ name, value, fill: COLORS[Object.keys(stats.dietDistribution).indexOf(name) % COLORS.length] }))
    : [];

  // Calculate family averages
  const familyAvgAge = familyMembers.length > 0
    ? (familyMembers.reduce((sum, m) => sum + parseInt(m.age || 0), 0) / familyMembers.length).toFixed(0)
    : 0;

  const familyAvgBMI = familyMembers.length > 0
    ? (familyMembers.reduce((sum, m) => {
        const bmi = m.height && m.weight ? m.weight / Math.pow(m.height / 100, 2) : 0;
        return sum + bmi;
      }, 0) / familyMembers.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="spinner w-8 h-8 border-2" />
          <p className="text-white/60">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold gradient-text mb-2">Dashboard</h1>
          <p className="text-white/60">Track your family's health journey</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            icon="👨‍👩‍👧‍👦" 
            value={familyMembers.length} 
            label="Family Members"
            subtitle={`Avg. age: ${familyAvgAge} years`}
            color="primary"
          />
          <StatCard 
            icon="📋" 
            value={stats?.totalPlans || 0} 
            label="Plans Generated"
            subtitle={`${stats?.activePlans || 0} active`}
            color="accent"
          />
          <StatCard 
            icon="⚖️" 
            value={familyAvgBMI} 
            label="Avg. Family BMI"
            subtitle={parseFloat(familyAvgBMI) < 25 ? "Healthy range" : "Above normal"}
            color="purple"
          />
          <StatCard 
            icon="🎯" 
            value={Object.keys(stats?.goalDistribution || {}).length} 
            label="Active Goals"
            subtitle="Across all members"
            color="blue"
          />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Fitness Goals */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Fitness Goals Distribution</h3>
            {goalChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={goalChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.3)" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} width={80} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="value" fill="#14b8a6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-white/40">
                No data yet
              </div>
            )}
          </motion.div>

          {/* Diet Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Diet Preferences</h3>
            {dietChartData.length > 0 ? (
              <div className="flex items-center">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={dietChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {dietChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {dietChartData.map((item, index) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                      <span className="text-sm text-white/70">{item.name}</span>
                      <span className="text-sm text-white/40 ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-white/40">
                No data yet
              </div>
            )}
          </motion.div>
        </div>

        {/* Wellness Check-In Widget */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <WellnessWidget />
        </motion.div>

        {/* Family Members Health Overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="text-xl font-semibold text-white mb-4">Family Health Overview</h3>
          {familyMembers.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {familyMembers.map((member, idx) => (
                <MemberHealthCard 
                  key={idx} 
                  member={member} 
                  plansCount={stats?.memberStats?.[member.fullName]?.count || 0}
                />
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 text-center text-white/50">
              No family members registered yet
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <a
              href="/planner"
              className="glass-card p-6 flex items-center gap-4 hover:bg-white/[0.08] transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                ✨
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Create New Plan</h4>
                <p className="text-sm text-white/50">Generate a personalized health plan</p>
              </div>
            </a>
            <div className="glass-card p-6 flex items-center gap-4 opacity-50 cursor-not-allowed">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 flex items-center justify-center text-2xl">
                📊
              </div>
              <div>
                <h4 className="font-semibold text-white mb-1">Export Data</h4>
                <p className="text-sm text-white/50">Coming soon...</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="text-xl font-semibold text-white mb-4">Recent Plans</h3>
          {plans.length > 0 ? (
            <div className="glass-card divide-y divide-white/5">
              {plans.slice(0, 5).map((plan, idx) => (
                <div key={plan._id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center text-lg">
                      📋
                    </div>
                    <div>
                      <p className="font-medium text-white">{plan.memberName}</p>
                      <p className="text-sm text-white/50">
                        {plan.dietType} • {plan.fitnessGoals?.join(', ')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white/40">
                      {new Date(plan.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-primary-400">{plan.workoutDays || 4} days/week</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card p-8 text-center">
              <p className="text-white/50 mb-4">No plans generated yet</p>
              <a href="/planner" className="btn-primary inline-flex items-center gap-2">
                <span>Create Your First Plan</span>
              </a>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
