import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  Home, 
  Music, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  User,
  Headphones
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
`;

const Sidebar = styled.aside`
  width: 280px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
    transform: ${props => props.isOpen ? 'translateX(0)' : 'translateX(-100%)'};
    width: 280px;
  }
`;

const SidebarHeader = styled.div`
  padding: 0 24px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 24px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 24px;
  font-weight: 700;
  color: white;
`;

const UserInfo = styled.div`
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0 24px 24px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
`;

const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-weight: 600;
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserEmail = styled.div`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Nav = styled.nav`
  flex: 1;
  padding: 0 16px;
`;

const NavList = styled.ul`
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const NavItem = styled.li``;

const NavLink = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: ${props => props.active ? 'rgba(255, 255, 255, 0.2)' : 'transparent'};
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const LogoutButton = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  margin-top: auto;

  &:hover {
    background: rgba(255, 0, 0, 0.1);
    color: #ff6b6b;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Header = styled.header`
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: white;
  margin: 0;
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 8px;

  @media (max-width: 768px) {
    display: block;
  }
`;

const Content = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
`;

const Overlay = styled.div`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;

  @media (max-width: 768px) {
    display: ${props => props.isOpen ? 'block' : 'none'};
  }
`;

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/playlists', label: 'Playlists', icon: Music },
    { path: '/recommendations', label: 'Discover', icon: Headphones },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavClick = (path) => {
    navigate(path);
    setSidebarOpen(false);
  };

  const getPageTitle = () => {
    const currentNav = navigation.find(nav => nav.path === location.pathname);
    return currentNav ? currentNav.label : 'MixMuse';
  };

  const getUserInitials = () => {
    if (user?.profile?.displayName) {
      return user.profile.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  return (
    <LayoutContainer>
      <Overlay isOpen={sidebarOpen} onClick={() => setSidebarOpen(false)} />
      
      <Sidebar isOpen={sidebarOpen}>
        <SidebarHeader>
          <Logo>
            <Headphones size={28} />
            MixMuse
          </Logo>
        </SidebarHeader>

        <UserInfo>
          <UserAvatar>
            {getUserInitials()}
          </UserAvatar>
          <UserDetails>
            <UserName>
              {user?.profile?.displayName || 'User'}
            </UserName>
            <UserEmail>
              {user?.email}
            </UserEmail>
          </UserDetails>
        </UserInfo>

        <Nav>
          <NavList>
            {navigation.map(({ path, label, icon: Icon }) => (
              <NavItem key={path}>
                <NavLink
                  active={location.pathname === path}
                  onClick={() => handleNavClick(path)}
                >
                  <Icon />
                  {label}
                </NavLink>
              </NavItem>
            ))}
          </NavList>
        </Nav>

        <LogoutButton onClick={handleLogout}>
          <LogOut />
          Logout
        </LogoutButton>
      </Sidebar>

      <Main>
        <Header>
          <MobileMenuButton onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </MobileMenuButton>
          <PageTitle>{getPageTitle()}</PageTitle>
        </Header>

        <Content>
          <Outlet />
        </Content>
      </Main>
    </LayoutContainer>
  );
};

export default Layout;


