import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from 'react-query';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase-config';
import styles from '../assets/CSS/Header.module.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const Header = () => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const userName = localStorage.getItem('fullName') || 'User';
  const userRole = (localStorage.getItem('role') || 'Role').trim();  
  const organizationId = localStorage.getItem('organizationId');  
  const userId = localStorage.getItem('userId');  

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);  
        const leaveRequestsRef = collection(db, 'leaveRequests');
        let leaveRequestsQuery;

        if (userRole === 'HR Manager') {
          leaveRequestsQuery = query(leaveRequestsRef, where('HrStatus', '==', 0), where('organizationID', '==', organizationId));
        } else if (userRole === 'CEO') {
          leaveRequestsQuery = query(leaveRequestsRef, where('CeoStatus', '==', 0),  where('HrStatus', '==', 1));
        } else if (userRole === 'HOD') {
          leaveRequestsQuery = query(leaveRequestsRef, where('HodStatus', '==', 0), where('organizationID', '==', organizationId));
        } else if (userRole === 'Employee') {
          leaveRequestsQuery = query(leaveRequestsRef, where('Status', '==', 1), where('userId', '==', userId));
        } else {
          return;  
        }

        const querySnapshot = await getDocs(leaveRequestsQuery);

        const allLeaveRequests = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          console.log('Leave Request:', data);

          return {
            message: userRole === "Employee" ?  `Your leave request has been Approved for reasson  ${data.leaveType}` : `Leave request from ${data.fullName}`,
            read: false,
          };});
          
        setNotifications(allLeaveRequests);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);  
      }
    };

    fetchNotifications();
  }, [userRole, organizationId, userId]);  

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen((prev) => !prev);
  };

  const handleLogout = () => {
    queryClient.clear();
    localStorage.clear();
    navigate('/');
  };

  const handleNotificationClick = () => {
    setNotificationDropdownOpen((prev) => !prev);
    if (!notificationDropdownOpen) {
      const updatedNotifications = notifications.map((notification) => ({
        ...notification,
        read: true,
      }));
      setNotifications(updatedNotifications);
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbarBrand}>
        <Link to="/">
          <img
            src="https://mdbcdn.b-cdn.net/img/logo/mdb-transaprent-noshadows.webp"
            alt="MDB Logo"
            loading="lazy"
          />
        </Link>
      </div>

      <div className="d-flex align-items-center">
        {(userRole === 'HR Manager' || userRole === 'CEO' || userRole === 'HOD' || userRole === 'Employee') && (
          <div className={styles.notification} onClick={handleNotificationClick}>
            <i className="fas fa-bell"></i>
            <span
              className={`${styles.notificationDot} ${
                notifications.some((notification) => !notification.read) ? styles.visible : ''
              }`}
            ></span>
          </div>
        )}

        <div className={styles.dropdown}>
          <div className={styles.avatar} onClick={toggleProfileDropdown}>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKqLoqUmsRrIYZhDUsffr5nkWfPcqC0guRC6Rpilz0C_VFhVRgr51-juuumrbvbEZ4V8k&usqp=CAU"
              alt="User Avatar"
              loading="lazy"
              className={styles.prof}
            />
          </div>
          <div className={`${styles.dropdownMenu} ${profileDropdownOpen ? styles.open : ''}`}>
            <div className={styles.dropdownItem}>
              <span className={styles.userName}>
                {userName} <span className={styles.userRole}>({userRole})</span>
              </span>
            </div>
            <div className={styles.dropdownItem}>
              <Link to="/update-profile">My profile</Link>
            </div>
            <div className={styles.dropdownItem} onClick={handleLogout}>
              Logout
            </div>
          </div>
        </div>
      </div>

      {notificationDropdownOpen && (
        <div className={styles.notificationDropdown}>
          {loading ? (
            <div className={styles.notificationItem}>Loading...</div>
          ) : notifications.length > 0 ? (
            notifications.map((notification, index) => (
              <div key={index} className={styles.notificationItem}>
                {notification.read ? (
                  <i className="fas fa-check-circle" style={{ color: 'green' }}></i>
                ) : (
                  <i className="fas fa-circle" style={{ color: 'orange' }}></i>
                )}
                {notification.message}
              </div>
            ))
          ) : (
            <div className={styles.notificationItem}>No new notifications</div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Header;
