import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Landing.module.css"; 
import agriBackground from "./Agribackground.jpeg"; 
import logo from "../../logo.png"; // Adjusted based on your file tree

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div 
            className={styles.container} 
            style={{ backgroundImage: `url(${agriBackground})` }}
        >
            <div className={styles.content}>
                <div className={styles.logoContainer}>
                    <img src={logo} alt="AgriConnect Logo" className={styles.logoImage} />
                </div>

                <h1 className={styles.title}>AgriConnect</h1>

                <button 
                    className={`${styles.btn} ${styles.farmerBtn}`} 
                    onClick={() => navigate("/farmerlogin")}
                >
                    Farmer Login
                </button>
                

                <button 
                    className={`${styles.btn} ${styles.buyerBtn}`} 
                    onClick={() => navigate("/consumer-login")}
                >
                    Buyer Login
                </button>
                <button 
                    className={`${styles.btn} ${styles.adminBtn}`} 
                    onClick={() => navigate("/admin-login")}
                >
                    Admin Login
                </button>
            </div>
        </div>
    );
};

export default Landing;