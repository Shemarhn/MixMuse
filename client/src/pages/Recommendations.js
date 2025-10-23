import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Headphones, 
  Play, 
  Heart, 
  Plus,
  Filter,
  Search,
  Sparkles,
  Music,
  Clock,
  User
} from 'lucide-react';

const RecommendationsContainer = styled.div`
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
  display: flex;
  align-items: center;
  gap: 12px;
`;

const SearchBar = styled.div`
  display: flex;
  gap: 12px;
  flex: 1;
  max-width: 400px;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const FilterButton = styled.button`
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const MoodFilters = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 24px;
`;

const MoodButton = styled.button`
  padding: 8px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const RecommendationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
`;

const RecommendationCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

const TrackInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
`;

const TrackImage = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
`;

const TrackDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const TrackName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TrackArtist = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TrackActions = styled.div`
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;

  ${RecommendationCard}:hover & {
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

  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  &.primary:hover {
    transform: scale(1.1);
  }
`;

const TrackMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
  margin-bottom: 12px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const MatchScore = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
`;

const ScoreBar = styled.div`
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
`;

const ScoreFill = styled.div`
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  width: ${props => props.score}%;
  transition: width 0.3s ease;
`;

const ScoreText = styled.span`
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.8rem;
  font-weight: 500;
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

const Recommendations = () => {
  const [activeMood, setActiveMood] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const moods = [
    { key: 'all', label: 'All Moods', emoji: '🎵' },
    { key: 'happy', label: 'Happy', emoji: '😊' },
    { key: 'sad', label: 'Melancholic', emoji: '😢' },
    { key: 'energetic', label: 'Energetic', emoji: '⚡' },
    { key: 'calm', label: 'Calm', emoji: '🌊' },
    { key: 'intense', label: 'Intense', emoji: '🔥' }
  ];

  // Mock data - in real app, this would come from API
  const recommendations = [
    {
      id: 1,
      name: 'Blinding Lights',
      artist: 'The Weeknd',
      album: 'After Hours',
      duration: '3:20',
      match: 92,
      mood: 'energetic',
      genre: 'Pop',
      service: 'spotify'
    },
    {
      id: 2,
      name: 'Levitating',
      artist: 'Dua Lipa',
      album: 'Future Nostalgia',
      duration: '3:23',
      match: 88,
      mood: 'happy',
      genre: 'Pop',
      service: 'spotify'
    },
    {
      id: 3,
      name: 'Good 4 U',
      artist: 'Olivia Rodrigo',
      album: 'SOUR',
      duration: '2:58',
      match: 85,
      mood: 'energetic',
      genre: 'Pop Rock',
      service: 'spotify'
    },
    {
      id: 4,
      name: 'Watermelon Sugar',
      artist: 'Harry Styles',
      album: 'Fine Line',
      duration: '2:54',
      match: 90,
      mood: 'happy',
      genre: 'Pop',
      service: 'spotify'
    },
    {
      id: 5,
      name: 'Industry Baby',
      artist: 'Lil Nas X ft. Jack Harlow',
      album: 'MONTERO',
      duration: '3:32',
      match: 87,
      mood: 'energetic',
      genre: 'Hip Hop',
      service: 'spotify'
    },
    {
      id: 6,
      name: 'Stay',
      artist: 'The Kid LAROI & Justin Bieber',
      album: 'F*CK LOVE 3: OVER YOU',
      duration: '2:21',
      match: 83,
      mood: 'sad',
      genre: 'Pop',
      service: 'spotify'
    }
  ];

  const filteredRecommendations = recommendations.filter(track => {
    const matchesMood = activeMood === 'all' || track.mood === activeMood;
    const matchesSearch = searchQuery === '' || 
      track.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMood && matchesSearch;
  });

  return (
    <RecommendationsContainer>
      <Header>
        <Title>
          <Sparkles size={28} />
          Discover Music
        </Title>
        
        <SearchBar>
          <SearchInput
            type="text"
            placeholder="Search for songs, artists, or albums..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <FilterButton>
            <Filter size={16} />
            Filters
          </FilterButton>
        </SearchBar>
      </Header>

      <MoodFilters>
        {moods.map(mood => (
          <MoodButton
            key={mood.key}
            active={activeMood === mood.key}
            onClick={() => setActiveMood(mood.key)}
          >
            <span style={{ marginRight: '8px' }}>{mood.emoji}</span>
            {mood.label}
          </MoodButton>
        ))}
      </MoodFilters>

      {filteredRecommendations.length > 0 ? (
        <RecommendationsGrid>
          {filteredRecommendations.map((track, index) => (
            <RecommendationCard
              key={track.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <TrackInfo>
                <TrackImage>
                  <Music size={24} />
                </TrackImage>
                <TrackDetails>
                  <TrackName>{track.name}</TrackName>
                  <TrackArtist>{track.artist}</TrackArtist>
                </TrackDetails>
                <TrackActions>
                  <ActionButton className="primary" title="Play">
                    <Play size={16} />
                  </ActionButton>
                  <ActionButton title="Add to Playlist">
                    <Plus size={16} />
                  </ActionButton>
                  <ActionButton title="Like">
                    <Heart size={16} />
                  </ActionButton>
                </TrackActions>
              </TrackInfo>

              <TrackMeta>
                <MetaItem>
                  <Clock size={14} />
                  {track.duration}
                </MetaItem>
                <MetaItem>
                  <User size={14} />
                  {track.genre}
                </MetaItem>
                <MetaItem>
                  {track.mood}
                </MetaItem>
              </TrackMeta>

              <MatchScore>
                <ScoreText>Match: {track.match}%</ScoreText>
                <ScoreBar>
                  <ScoreFill score={track.match} />
                </ScoreBar>
              </MatchScore>
            </RecommendationCard>
          ))}
        </RecommendationsGrid>
      ) : (
        <EmptyState>
          <EmptyIcon>
            <Headphones size={48} />
          </EmptyIcon>
          <EmptyTitle>No recommendations found</EmptyTitle>
          <EmptyDescription>
            {searchQuery 
              ? `No tracks found matching "${searchQuery}". Try a different search term.`
              : 'No recommendations available for the selected mood. Try a different mood filter.'
            }
          </EmptyDescription>
        </EmptyState>
      )}
    </RecommendationsContainer>
  );
};

export default Recommendations;
