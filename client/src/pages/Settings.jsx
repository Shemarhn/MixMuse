import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  User, 
  Music, 
  Bell, 
  Shield,
  Link,
  Unlink,
  Save,
  Edit,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

const SettingsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 600;
  color: white;
  margin: 0;
`;

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
`;

const SettingsCard = styled(motion.div)`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const CardTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin: 0;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  color: white;
  font-weight: 500;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  option {
    background: #1a1a1a;
    color: white;
  }
`;

const Slider = styled.input`
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.2);
  outline: none;
  -webkit-appearance: none;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    cursor: pointer;
  }

  &::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    cursor: pointer;
    border: none;
  }
`;

const SliderValue = styled.div`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin-top: 8px;
  text-align: center;
`;

const Switch = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const SwitchInput = styled.input`
  display: none;
`;

const SwitchSlider = styled.div`
  width: 50px;
  height: 24px;
  background: ${props => props.checked ? '#667eea' : 'rgba(255, 255, 255, 0.2)'};
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.checked ? '26px' : '2px'};
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: all 0.3s ease;
  }
`;

const ServiceCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  margin-bottom: 12px;
`;

const ServiceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ServiceIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
`;

const ServiceDetails = styled.div``;

const ServiceName = styled.div`
  color: white;
  font-weight: 500;
  margin-bottom: 4px;
`;

const ServiceStatus = styled.div`
  color: ${props => props.connected ? '#43e97b' : 'rgba(255, 255, 255, 0.6)'};
  font-size: 0.9rem;
`;

const ServiceButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &.connect {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  &.disconnect {
    background: rgba(255, 0, 0, 0.1);
    color: #ff6b6b;
    border: 1px solid rgba(255, 0, 0, 0.2);
  }

  &:hover {
    transform: translateY(-1px);
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &.primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  &.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  &.danger {
    background: rgba(255, 0, 0, 0.1);
    color: #ff6b6b;
    border: 1px solid rgba(255, 0, 0, 0.2);
  }

  &:hover {
    transform: translateY(-1px);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Settings = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [settings, setSettings] = useState({
    displayName: 'John Doe',
    email: 'john@example.com',
    primaryService: 'spotify',
    explorationLevel: 0.5,
    playlistLength: 30,
    autoSync: true,
    emailNotifications: true,
    pushNotifications: false,
    dataSharing: false
  });

  const services = [
    {
      id: 'spotify',
      name: 'Spotify',
      connected: true,
      icon: '🎵'
    },
    {
      id: 'youtube',
      name: 'YouTube Music',
      connected: true,
      icon: '📺'
    },
    {
      id: 'apple',
      name: 'Apple Music',
      connected: false,
      icon: '🍎'
    },
    {
      id: 'lastfm',
      name: 'Last.fm',
      connected: true,
      icon: '📊'
    }
  ];

  const handleInputChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Save settings logic
    console.log('Saving settings:', settings);
  };

  const handleConnectService = (serviceId) => {
    console.log('Connecting service:', serviceId);
  };

  const handleDisconnectService = (serviceId) => {
    console.log('Disconnecting service:', serviceId);
  };

  return (
    <SettingsContainer>
      <Header>
        <SettingsIcon size={28} />
        <Title>Settings</Title>
      </Header>

      <SettingsGrid>
        <SettingsCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <CardHeader>
            <User size={20} />
            <CardTitle>Profile</CardTitle>
          </CardHeader>

          <FormGroup>
            <Label>Display Name</Label>
            <Input
              type="text"
              value={settings.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label>Email</Label>
            <Input
              type="email"
              value={settings.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label>Primary Music Service</Label>
            <Select
              value={settings.primaryService}
              onChange={(e) => handleInputChange('primaryService', e.target.value)}
            >
              <option value="spotify">Spotify</option>
              <option value="youtube">YouTube Music</option>
              <option value="apple">Apple Music</option>
              <option value="lastfm">Last.fm</option>
            </Select>
          </FormGroup>

          <ButtonGroup>
            <Button className="primary" onClick={handleSave}>
              <Save size={16} />
              Save Changes
            </Button>
          </ButtonGroup>
        </SettingsCard>

        <SettingsCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <CardHeader>
            <Music size={20} />
            <CardTitle>Music Preferences</CardTitle>
          </CardHeader>

          <FormGroup>
            <Label>Exploration Level: {Math.round(settings.explorationLevel * 100)}%</Label>
            <Slider
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={settings.explorationLevel}
              onChange={(e) => handleInputChange('explorationLevel', parseFloat(e.target.value))}
            />
            <SliderValue>
              {settings.explorationLevel < 0.3 ? 'Familiar' : 
               settings.explorationLevel < 0.7 ? 'Balanced' : 'Discovery'}
            </SliderValue>
          </FormGroup>

          <FormGroup>
            <Label>Default Playlist Length: {settings.playlistLength} tracks</Label>
            <Slider
              type="range"
              min="10"
              max="100"
              step="5"
              value={settings.playlistLength}
              onChange={(e) => handleInputChange('playlistLength', parseInt(e.target.value))}
            />
          </FormGroup>

          <FormGroup>
            <Switch>
              <SwitchInput
                type="checkbox"
                checked={settings.autoSync}
                onChange={(e) => handleInputChange('autoSync', e.target.checked)}
              />
              <SwitchSlider checked={settings.autoSync} />
              <span style={{ color: 'white' }}>Auto-sync listening data</span>
            </Switch>
          </FormGroup>
        </SettingsCard>

        <SettingsCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <CardHeader>
            <Link size={20} />
            <CardTitle>Connected Services</CardTitle>
          </CardHeader>

          {services.map(service => (
            <ServiceCard key={service.id}>
              <ServiceInfo>
                <ServiceIcon>{service.icon}</ServiceIcon>
                <ServiceDetails>
                  <ServiceName>{service.name}</ServiceName>
                  <ServiceStatus connected={service.connected}>
                    {service.connected ? 'Connected' : 'Not Connected'}
                  </ServiceStatus>
                </ServiceDetails>
              </ServiceInfo>
              <ServiceButton
                className={service.connected ? 'disconnect' : 'connect'}
                onClick={() => service.connected 
                  ? handleDisconnectService(service.id) 
                  : handleConnectService(service.id)
                }
              >
                {service.connected ? (
                  <>
                    <Unlink size={16} />
                    Disconnect
                  </>
                ) : (
                  <>
                    <Link size={16} />
                    Connect
                  </>
                )}
              </ServiceButton>
            </ServiceCard>
          ))}
        </SettingsCard>

        <SettingsCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <CardHeader>
            <Bell size={20} />
            <CardTitle>Notifications</CardTitle>
          </CardHeader>

          <FormGroup>
            <Switch>
              <SwitchInput
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleInputChange('emailNotifications', e.target.checked)}
              />
              <SwitchSlider checked={settings.emailNotifications} />
              <span style={{ color: 'white' }}>Email notifications</span>
            </Switch>
          </FormGroup>

          <FormGroup>
            <Switch>
              <SwitchInput
                type="checkbox"
                checked={settings.pushNotifications}
                onChange={(e) => handleInputChange('pushNotifications', e.target.checked)}
              />
              <SwitchSlider checked={settings.pushNotifications} />
              <span style={{ color: 'white' }}>Push notifications</span>
            </Switch>
          </FormGroup>
        </SettingsCard>

        <SettingsCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <CardHeader>
            <Shield size={20} />
            <CardTitle>Privacy & Security</CardTitle>
          </CardHeader>

          <FormGroup>
            <Switch>
              <SwitchInput
                type="checkbox"
                checked={settings.dataSharing}
                onChange={(e) => handleInputChange('dataSharing', e.target.checked)}
              />
              <SwitchSlider checked={settings.dataSharing} />
              <span style={{ color: 'white' }}>Share anonymized data for improvements</span>
            </Switch>
          </FormGroup>

          <ButtonGroup>
            <Button className="secondary">
              <Edit size={16} />
              Change Password
            </Button>
            <Button className="danger">
              <Trash2 size={16} />
              Delete Account
            </Button>
          </ButtonGroup>
        </SettingsCard>
      </SettingsGrid>
    </SettingsContainer>
  );
};

export default Settings;
