import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MDBContainer, MDBCol, MDBRow, MDBInput, MDBCheckbox } from 'mdb-react-ui-kit';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../assets/CSS/LoginPage.module.css';
import { auth, db } from '../firebase-config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { getDoc, doc } from 'firebase/firestore';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem('role');
    const userId = localStorage.getItem('userId');

    if (role && userId) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        toast.error('Veuillez vérifier votre adresse e-mail avant de vous connecter.');
        setLoading(false);
        return;
      }

      const userDoc = await getDoc(doc(db, "Users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const { role, fullName, organizationId } = userData;

        localStorage.setItem('role', role);
        localStorage.setItem('userId', user.uid);
        localStorage.setItem('fullName', fullName);
        localStorage.setItem('organizationId', organizationId);

        toast.success("Connexion réussie !");
        navigate(role === "Employee" ? '/leaveoverview' : 
                 role === "HR Manager" ? '/homehr' : 
                 role === "HOD" ? '/leavesDataHOD' : 
                 role === "CEO" ? '/ceohome' : 
                 '/adminhome');
      } else {
        toast.error('Utilisateur introuvable dans Firestore.');
      }
    } catch (err) {
      console.error('Error during login:', err);
      toast.error('Erreur lors de la connexion : ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MDBContainer fluid className="p-3 my-5 h-100 d-flex justify-content-center align-items-center">
        <MDBRow className="d-flex justify-content-center align-items-center w-100">
          <MDBCol md='6' className="d-none d-md-flex justify-content-center">
            <img
              src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.webp"
              className="img-fluid"
              alt="Sample image"
            />
          </MDBCol>

          <MDBCol md='6'>
            <h2 className="text-center mb-4">Se connecter</h2>
            <form onSubmit={handleLogin} className={styles.formContainer}>
              <MDBInput
                wrapperClass='mb-4'
                label='Adresse email'
                id='email'
                type='email'
                size="lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
              <MDBInput
                wrapperClass='mb-4'
                label='Mot de passe'
                id='password'
                type='password'
                size="lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
              <div className="d-flex justify-content-between mb-4">
                 <Link to="/forgot" className="link-danger">Mot de passe oublié ?</Link>
              </div>
              <div className='text-center text-md-start mt-4 pt-2'>
                <button 
                  className={`${styles.loginButton} mb-0 px-5`} 
                  size='lg' 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? 'Connexion...' : 'Connexion'}
                </button>
                <p className="small fw-bold mt-2 pt-1 mb-2 "> 
                Vous n'avez pas de compte ? <Link to="/signup" className="link-danger">Registre</Link>
                </p>
              </div>
            </form>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
      <ToastContainer />
    </>
  );
};

export default LoginPage;
