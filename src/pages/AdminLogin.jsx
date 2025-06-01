import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './AdminLogin.css';

const REQUIRED_WALLET = "0x9dcb35a0e02b0759f675b65dfe1f6031b47ff8f5".toLowerCase();
const ADMIN_EMAIL = "muhammadhasaanwork@gmail.com";

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [wallet, setWallet] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const sendOtp = async () => {
    if (email !== ADMIN_EMAIL) {
      setMessage('Only the admin email (muhammadhasaanwork@gmail.com) is allowed.');
      return;
    }
    setIsLoading(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      setOtpSent(true);
      setMessage('OTP sent to your email. Please check your inbox (and spam folder).');
    } catch (error) {
      console.error('Error sending OTP:', error.message);
      setMessage('Error sending OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      setMessage('Please enter the OTP.');
      return;
    }
    setIsLoading(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' });
      if (error) throw error;
      setOtpVerified(true);
      setMessage('OTP verified successfully. Please connect your wallet.');
    } catch (error) {
      console.error('Error verifying OTP:', error.message);
      setMessage('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const connectWalletAndLogin = async () => {
    if (typeof window.ethereum === 'undefined') {
      setMessage('MetaMask is not installed. Please install MetaMask to proceed.');
      return;
    }
    setIsLoading(true);
    setMessage('');
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const connectedWallet = accounts[0].toLowerCase();
      setWallet(connectedWallet);
      if (connectedWallet === REQUIRED_WALLET) {
        setMessage('Login successful. Redirecting to dashboard...');
        setTimeout(() => navigate('/admin-dashboard'), 1000); // Slight delay for feedback
      } else {
        setMessage('This wallet is not authorized for admin access.');
      }
    } catch (error) {
      console.error('Error connecting wallet:', error.message);
      setMessage('Error connecting to MetaMask. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-container d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-lg p-4 animate-card" style={{ maxWidth: '450px', width: '100%', borderRadius: '20px', border: 'none' }}>
        <div className="text-center mb-4">
          <img src="https://media.istockphoto.com/id/1033906526/vector/donate-blood-concept-with-blood-bag-and-heart-blood-donation-vector-illustration-world-blood.jpg?s=612x612&w=0&k=20&c=bCDDE6DiGdlFspMA1RKRNeLBUWugSmi8U73ZCfYSbpg=" alt="Blood Link Logo" className="mb-3 logo" />
          <h2 className="text-danger fw-bold">Blood Link Admin</h2>
          <p className="text-muted mb-2">Secure login for managing blood donation services</p>
          <small className="text-muted">Use your admin email and MetaMask wallet to access the dashboard.</small>
        </div>

        {message && (
          <div className={`alert ${message.includes('Error') || message.includes('not authorized') || message.includes('Invalid') ? 'alert-danger' : 'alert-success'} fade-in mb-3`}>
            {message}
          </div>
        )}

        {!otpSent ? (
          <div className="form-group">
            <label className="form-label fw-semibold mb-2">Admin Email</label>
            <div className="input-group">
              <span className="input-group-text bg-danger text-white">
                <i className="fas fa-envelope"></i>
              </span>
              <input
                type="email"
                className="form-control"
                placeholder="Admin-Email-Adress@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <button
              className="btn btn-danger w-100 mt-3"
              onClick={sendOtp}
              disabled={isLoading || !email}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Sending OTP...
                </>
              ) : (
                'Send OTP'
              )}
            </button>
          </div>
        ) : !otpVerified ? (
          <div className="form-group">
            <label className="form-label fw-semibold mb-2">Enter OTP</label>
            <div className="input-group">
              <span className="input-group-text bg-danger text-white">
                <i className="fas fa-lock"></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <button
              className="btn btn-danger w-100 mt-3"
              onClick={verifyOtp}
              disabled={isLoading || !otp}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Verifying OTP...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>
            <small className="text-muted d-block mt-2 text-center">
              Didn't receive the OTP? <a href="#" onClick={sendOtp} className="text-danger">Resend</a>
            </small>
          </div>
        ) : (
          <div className="form-group">
            <button
              className="btn btn-danger w-100"
              onClick={connectWalletAndLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Connecting...
                </>
              ) : (
                <>
                  <i className="fab fa-ethereum me-2"></i>Connect Wallet & Login
                </>
              )}
            </button>
            {wallet && (
              <div className="alert alert-info mt-3 fade-in">
                Connected Wallet: <span className="fw-semibold text-break">{wallet}</span>
              </div>
            )}
            <small className="text-muted d-block mt-2 text-center">
              Ensure MetaMask is installed and connected to the correct network.
            </small>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminLogin;