import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./sidebar.module.css";
import classNames from "classnames";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";

// om det ska in logic i navItems, som kan hantera ett onclick event då flyttar vi in den i komponenten
// const navItems = {   // navigation har ett objekt med key-values.
//   "/": {
//     name: "Home",
//   },
//   "/about": {
//     name: "About",  // klickar på About i sidebar betyder att routern/url:en kommer vara /about
//   },
//   "/blog": {
//     name: "Blog",
//   },
//   "/create-post": {
//     name: "Create post",
//   },
//   "/login": {
//     name: "Login",
//   },
// };

// vår komponent Navbar
export default function Navbar() {
  const supabaseClient = useSupabaseClient();
  const user = useUser(); // innehåller information om vår användare

  let pathname = usePathname() || "/";
  if (pathname.includes("/blog/")) {
    pathname = "/blog";
  }

  const navItems = {   // navigation har ett objekt med key-values.
    "/": {
      name: "Home",
    },
    "/about": {
      name: "About",  // klickar på About i sidebar betyder att routern/url:en kommer vara /about
    },
    "/blog": {
      name: "Blog",
    },
    "/create-post": {  // om man inte är autentiserad, så visa INTE   
      name: "Create post",
      requiresAuth: true,
    },
    "/login": {
      name: "Login",
      requiresAuth: false,
    },
    "/logout": {
      name: "Logout",
      requiresAuth: true,
      onClick: async () => {
        await supabaseClient.auth.signOut();
        console.log("clicked");
      },
    }
  };

  return (
    <aside className={styles.container}>
      <div className={styles.sticky}>
        <nav className={styles.navigation} id="nav">
          <div className={styles.navigationItemWrapper}>
            {Object.entries(navItems).map(([path, { name, requiresAuth, onClick }]) => {
              const isActive = path === pathname;

              // vill inte rendera en länk som kräver auth och det inte finns en användare.
              // path == /logout, name == "Logout" etc
              // om ett av våra objekt i listan kräver autentisering men det INTE finns en användare = requiresAuth && !user
              // om path == /login men det finns en autentiserad användare då visar vi INTE login = "/login" && user
              if ((requiresAuth && !user) || (path === "/login" && user)) {
                return null; // betyder att det nedanför ALDRIG kommer exekveras
              }

              if (path === "/logout") {
                return (
                  <button
                    key={path}
                    onClick={onClick}
                    className={classNames(styles.navigationButton, {
                      [styles.textNeutral]: !isActive,
                      [styles.fontBold]: isActive,
                    })}
                  >
                    {name}
                  </button>
                )
              }

              return (
                <Link   // skulle kunna lista alla sidabar länkar direkt med <Link>Home</Link> etc
                  key={path}
                  href={path}
                  className={classNames(styles.navigationItem, {
                    [styles.textNeutral]: !isActive,
                    [styles.fontBold]: isActive,
                  })}
                >
                  <span className={styles.linkName}>{name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
}
