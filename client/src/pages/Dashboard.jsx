import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Music, 
  Headphones, 
  BarChart3, 
  Plus, 
  Play, 
  Clock,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';

const DashboardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const WelcomeSection = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
`;

const WelcomeTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const WelcomeSubtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 32px;
`;

const QuickActions = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
`;

const StatCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: white;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
`;

const RecentPlaylists = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PlaylistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const PlaylistCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    transform: translateY(-2px);
  }
`;

const PlaylistName = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
`;

const PlaylistInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
`;

const PlaylistMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: rgba(255, 255, 255, 0.6);
`;

const EmptyIcon = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: rgba(255, 255, 255, 0.4);
`;

const Dashboard = () => {
  // Mock data - in real app, this would come from API
  const stats = [
    { icon: Music, number: '12', label: 'Playlists Created' },
    { icon: Headphones, number: '1,247', label: 'Tracks Analyzed' },
    { icon: BarChart3, number: '8', label: 'Genres Discovered' },
    { icon: TrendingUp, number: '95%', label: 'Match Accuracy' }
  ];

  const recentPlaylists = [
    { id: 1, name: 'Morning Vibes', tracks: 24, duration: '1h 23m', created: '2 hours ago' },
    { id: 2, name: 'Workout Mix', tracks: 18, duration: '1h 12m', created: '1 day ago' },
    { id: 3, name: 'Chill Evening', tracks: 32, duration: '2h 8m', created: '3 days ago' }
  ];

  return (
    <DashboardContainer>
      <WelcomeSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <WelcomeTitle>Welcome to MixMuse</WelcomeTitle>
        <WelcomeSubtitle>
          Your AI-powered music discovery platform is ready to create amazing playlists
        </WelcomeSubtitle>
        
        <QuickActions>
          <ActionButton>
            <Plus size={20} />
            Generate Playlist
          </ActionButton>
          <ActionButton>
            <Headphones size={20} />
            Discover Music
          </ActionButton>
          <ActionButton>
            <BarChart3 size={20} />
            View Analytics
          </ActionButton>
        </QuickActions>
      </WelcomeSection>

      <StatsGrid>
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <StatIcon>
              <stat.icon size={24} />
            </StatIcon>
            <StatNumber>{stat.number}</StatNumber>
            <StatLabel>{stat.label}</StatLabel>
          </StatCard>
        ))}
      </StatsGrid>

      <RecentPlaylists
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <SectionTitle>
          <Music size={24} />
          Recent Playlists
        </SectionTitle>

        {recentPlaylists.length > 0 ? (
          <PlaylistGrid>
            {recentPlaylists.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <PlaylistName>{playlist.name}</PlaylistName>
                <PlaylistInfo>
                  <PlaylistMeta>
                    <Play size={16} />
                    {playlist.tracks} tracks
                  </PlaylistMeta>
                  <PlaylistMeta>
                    <Clock size={16} />
                    {playlist.duration}
                  </PlaylistMeta>
                  <PlaylistMeta>
                    {playlist.created}
                  </PlaylistMeta>
                </PlaylistInfo>
              </PlaylistCard>
            ))}
          </PlaylistGrid>
        ) : (
          <EmptyState>
            <EmptyIcon>
              <Music size={32} />
            </EmptyIcon>
            <h3>No playlists yet</h3>
            <p>Generate your first AI-curated playlist to get started</p>
          </EmptyState>
        )}
      </RecentPlaylists>
    </DashboardContainer>
  );
};

export default Dashboard;
