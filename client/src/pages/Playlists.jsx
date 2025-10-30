import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Music, 
  Plus, 
  Play, 
  Clock, 
  MoreVertical,
  Download,
  Share2,
  Trash2,
  Edit
} from 'lucide-react';

const PlaylistsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: white;
  margin: 0;
`;

const CreateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
  }
`;

const Filters = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const PlaylistsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
`;

const PlaylistCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

const PlaylistHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const PlaylistInfo = styled.div`
  flex: 1;
`;

const PlaylistName = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin-bottom: 8px;
`;

const PlaylistDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-bottom: 16px;
`;

const PlaylistMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const PlaylistActions = styled.div`
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${PlaylistCard}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const PlaylistFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const GeneratedBy = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
`;

const CreatedDate = styled.div`
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: rgba(255, 255, 255, 0.6);
`;

const EmptyIcon = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: rgba(255, 255, 255, 0.4);
`;

const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: white;
  margin-bottom: 12px;
`;

const EmptyDescription = styled.p`
  font-size: 1rem;
  margin-bottom: 32px;
`;

const Playlists = () => {
  const [activeFilter, setActiveFilter] = useState('all');

  // Mock data - in real app, this would come from API
  const playlists = [
    {
      id: 1,
      name: 'Morning Vibes',
      description: 'Perfect start to your day with upbeat and energizing tracks',
      tracks: 24,
      duration: '1h 23m',
      generatedBy: 'ai',
      createdAt: '2 hours ago',
      genre: 'Pop',
      mood: 'Energetic'
    },
    {
      id: 2,
      name: 'Workout Mix',
      description: 'High-energy tracks to keep you motivated during your workout',
      tracks: 18,
      duration: '1h 12m',
      generatedBy: 'ai',
      createdAt: '1 day ago',
      genre: 'Electronic',
      mood: 'Intense'
    },
    {
      id: 3,
      name: 'Chill Evening',
      description: 'Relaxing tracks for a peaceful evening',
      tracks: 32,
      duration: '2h 8m',
      generatedBy: 'manual',
      createdAt: '3 days ago',
      genre: 'Ambient',
      mood: 'Calm'
    },
    {
      id: 4,
      name: 'Road Trip',
      description: 'Classic hits and modern favorites for your journey',
      tracks: 28,
      duration: '1h 45m',
      generatedBy: 'hybrid',
      createdAt: '1 week ago',
      genre: 'Rock',
      mood: 'Happy'
    }
  ];

  const filters = [
    { key: 'all', label: 'All Playlists' },
    { key: 'ai', label: 'AI Generated' },
    { key: 'manual', label: 'Manual' },
    { key: 'hybrid', label: 'Hybrid' }
  ];

  const filteredPlaylists = activeFilter === 'all' 
    ? playlists 
    : playlists.filter(playlist => playlist.generatedBy === activeFilter);

  const getGeneratedByIcon = (type) => {
    switch (type) {
      case 'ai': return '🤖';
      case 'manual': return '✋';
      case 'hybrid': return '🔀';
      default: return '🎵';
    }
  };

  const getGeneratedByLabel = (type) => {
    switch (type) {
      case 'ai': return 'AI Generated';
      case 'manual': return 'Manual';
      case 'hybrid': return 'Hybrid';
      default: return 'Unknown';
    }
  };

  return (
    <PlaylistsContainer>
      <Header>
        <Title>My Playlists</Title>
        <CreateButton>
          <Plus size={20} />
          Create Playlist
        </CreateButton>
      </Header>

      <Filters>
        {filters.map(filter => (
          <FilterButton
            key={filter.key}
            active={activeFilter === filter.key}
            onClick={() => setActiveFilter(filter.key)}
          >
            {filter.label}
          </FilterButton>
        ))}
      </Filters>

      {filteredPlaylists.length > 0 ? (
        <PlaylistsGrid>
          {filteredPlaylists.map((playlist, index) => (
            <PlaylistCard
              key={playlist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <PlaylistHeader>
                <PlaylistInfo>
                  <PlaylistName>{playlist.name}</PlaylistName>
                  <PlaylistDescription>{playlist.description}</PlaylistDescription>
                </PlaylistInfo>
                
                <PlaylistActions>
                  <ActionButton title="Play">
                    <Play size={16} />
                  </ActionButton>
                  <ActionButton title="Download">
                    <Download size={16} />
                  </ActionButton>
                  <ActionButton title="Share">
                    <Share2 size={16} />
                  </ActionButton>
                  <ActionButton title="More">
                    <MoreVertical size={16} />
                  </ActionButton>
                </PlaylistActions>
              </PlaylistHeader>

              <PlaylistMeta>
                <MetaItem>
                  <Music size={16} />
                  {playlist.tracks} tracks
                </MetaItem>
                <MetaItem>
                  <Clock size={16} />
                  {playlist.duration}
                </MetaItem>
                <MetaItem>
                  {playlist.genre}
                </MetaItem>
                <MetaItem>
                  {playlist.mood}
                </MetaItem>
              </PlaylistMeta>

              <PlaylistFooter>
                <GeneratedBy>
                  <span>{getGeneratedByIcon(playlist.generatedBy)}</span>
                  {getGeneratedByLabel(playlist.generatedBy)}
                </GeneratedBy>
                <CreatedDate>{playlist.createdAt}</CreatedDate>
              </PlaylistFooter>
            </PlaylistCard>
          ))}
        </PlaylistsGrid>
      ) : (
        <EmptyState>
          <EmptyIcon>
            <Music size={48} />
          </EmptyIcon>
          <EmptyTitle>No playlists found</EmptyTitle>
          <EmptyDescription>
            {activeFilter === 'all' 
              ? "You haven't created any playlists yet. Generate your first AI-curated playlist to get started!"
              : `No ${filters.find(f => f.key === activeFilter)?.label.toLowerCase()} playlists found.`
            }
          </EmptyDescription>
          <CreateButton>
            <Plus size={20} />
            Create Your First Playlist
          </CreateButton>
        </EmptyState>
      )}
    </PlaylistsContainer>
  );
};

export default Playlists;
