import styles from "../styles/Header.module.css";

const Header = () => {
  return (
    <header className={styles.container}>
    <ul className={styles.menu}>
	<li className={styles.menuItem}>
		<a href="/register">Register</a>
	</li>
	<li className={styles.menuItem}>
		<a href="/meeting">Meeting</a>
	</li>
    </ul>
    </header>
  );
};

export default Header;
