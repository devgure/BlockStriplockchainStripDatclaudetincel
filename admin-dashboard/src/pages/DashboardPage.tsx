
import { useState, useEffect } from 'react';
import { apiClient } from '../services/adminApi';
import { Users, DollarSign, Flag, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    pendingReports: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await apiClient.get('/api/v1/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  return (
    
      Admin Dashboard
      
      
        }
          color="blue"
        />
        }
          color="green"
        />
        }
          color="yellow"
        />
        }
          color="red"
        />
      

      
        
          Recent Users
          {/* User list component */}
        
        
        
          Revenue Chart
          {/* Chart component */}
        
      
    
  );
}

function StatCard({ title, value, icon, color }: any) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
  };

  return (
    
      
        
          {title}
          {value}
        
        
          {icon}
        
      
    
  );
}