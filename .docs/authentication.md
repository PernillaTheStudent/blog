# Setup authentication on your blog

Docs for the pages directory:
https://supabase.com/docs/guides/auth/auth-helpers/nextjs-pages

The whole demo is recorded and i highy recommend to watch it unless you haven't already.
This is a text summary of what we have done in order to add authentication and protected routes using supabase auth & a middleware file.

## Set environment variables:

Its important that the environment variables is set to the project in the .env.local (or .env file).

```
NEXT_PUBLIC_SUPABASE_ANON_KEY="anon-key-here"
NEXT_PUBLIC_SUPABASE_URL="supabase-url-here"
```

## Install dependencies:

`npm install @supabase/auth-helpers-nextjs @supabase/auth-helpers-react @supabase/auth-ui-react @supabase/auth-ui-shared`

## Implement a context provider and create a new instance of a supabase client.

In our `_app.tsx` file, wrap the current app in the provider as described in the documentation[https://supabase.com/docs/guides/auth/auth-helpers/nextjs-pages#basic-setup]

In our case, our `_app.tsx` will look like this:

```
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import RootLayout from "../components/root-layout";

import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { useState } from "react";

export default function App({ Component, pageProps }: AppProps) {
  // Create a new supabase browser client on every first render.
  const [supabaseClient] = useState(() => createPagesBrowserClient());

  return (
    <>
      <SessionContextProvider
        supabaseClient={supabaseClient}
        initialSession={pageProps.initialSession}
      >
        <RootLayout>
          <Component {...pageProps} />
        </RootLayout>
        <div id="root" />
      </SessionContextProvider>
    </>
  );
}
```

## Change our page.jsx file in /pages/login.

With the context provider in place, we can now implement supabase's Auth component that we installed in the previous step when we installed new dependencies.

Remove all previous content in the index.jsx file and replace it with the Auth component and some additional functionality.

```
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useEffect } from "react";
import { useRouter } from "next/router";

const LoginPage = () => {
  const supabaseClient = useSupabaseClient();
  const user = useUser();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  return (
    <Auth
      redirectTo="http://localhost:3000/"
      appearance={{ theme: ThemeSupa }}
      supabaseClient={supabaseClient}
      providers={[]}
      socialLayout="horizontal"
    />
  );
};

export default LoginPage;
```

## Trigger & sql function

With this component in place all new users that is created in our project will be added in the auth schema in our supabase project.

Some of the students added an uppercase name for the table names (totally my fault since in my example of the table i added an uppercase on the first letter on each table name), i would highly recommend to add a lowercase on all table names (its standard).

Inside the supabase project, go to the sql editor and create a trigger and a sql function that keeps track on if a new user row is being added (a new user is created in the auth schema) and if so, we add a new row with that user info in our users table in our public schema.

The SQL code to create this trigger and function looks like this:

```
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

Paste this into the SQL editor and click on "Run".
The message that should be returned should be something like: "Success. No rows returned".

## Create a new user

With this functionality in place, lets add a new user via the Auth component in our blog project.
Navigate to `/login` and create a new user. This should result in an activation email being sent to the email you added. Click on that activation link.

Now you should have a new user in your public users table if everything is setup correctly.

## Change the sidebar navigation component based on if a user is authenticated or not.

We did some changes on the `sidebar/index.js` & `sidebar.module.css` file in order to don't display the `Create post` navigation item unless the user is authenticated, but also display a `Logout` item in order for the user to logout if they are authenticated.

The index.jsx file:

```
import { usePathname } from "next/navigation";
import Link from "next/link";
import styles from "./sidebar.module.css";
import classNames from "classnames";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();
  const supabaseClient = useSupabaseClient();
  const user = useUser();

  let pathname = usePathname() || "/";
  if (pathname.includes("/blog/")) {
    pathname = "/blog";
  }

  const navItems = {
    "/": {
      name: "Home",
    },
    "/about": {
      name: "About",
    },
    "/blog": {
      name: "Blog",
    },
    "/create-post": {
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
        router.push("/login");
      },
    },
  };

  return (
    <aside className={styles.container}>
      <div className={styles.sticky}>
        <nav className={styles.navigation} id="nav">
          <div className={styles.navigationItemWrapper}>
            {Object.entries(navItems).map(
              ([path, { name, requiresAuth, onClick }]) => {
                const isActive = path === pathname;

                // vill inte renders en länk som kräver auth och det inte finns en användare.
                if ((requiresAuth && !user) || (path === "/login" && user)) {
                  return null;
                }

                if (path === "/logout") {
                  return (
                    <button
                      className={classNames(styles.navigationButton, {
                        [styles.textNeutral]: !isActive,
                        [styles.fontBold]: isActive,
                      })}
                      key={path}
                      onClick={onClick}
                    >
                      {name}
                    </button>
                  );
                }

                return (
                  <Link
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
              }
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
}
```

The sidebar.module.css file:

```
.container {
  margin-right: -1rem;
  margin-left: -1rem;
  padding-right: 0;
  padding-left: 0;
}

@media (min-width: 768px) {
  .container {
    width: 150px;
    flex-shrink: 0;
    margin-right: 0;
    margin-left: 0;
  }
}

@media (min-width: 1024px) {
  .sticky {
    position: sticky;
    top: 5rem;
  }
}

.navigation {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  position: relative;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-bottom: 0;
}

@media (min-width: 768px) {
  .navigation {
    flex-direction: column;
    padding-left: 0;
    padding-right: 0;
    overflow: auto;
    position: relative;
  }
}

.navigationItemWrapper {
  display: flex;
  flex-direction: row;
  margin-bottom: 0.5rem;
  margin-top: 0.5rem;
}

@media (min-width: 768px) {
  .navigationItemWrapper {
    padding-right: 2.5rem;
    flex-direction: column;
    margin-top: 0;
  }
}

.navigationButton {
  background: none;
  color: inherit;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;

  position: relative;
  padding-top: 5px;
  padding-bottom: 5px;
  padding-left: 10px;
  padding-right: 10px;
  white-space: nowrap;
  text-align: left;
}

.navigationItem {
  display: flex;
  align-items: middle;
  margin-bottom: 0.5rem;
  color: inherit;
  text-decoration: none;
}

.navigationItem:hover,
.navigationButton:hover {
  color: #333;
}

.textNeutral {
  color: #71717a;
}

.fontBold {
  font-weight: 500;
  background-color: #f5f5f5;
}

.linkName {
  position: relative;
  padding-top: 5px;
  padding-bottom: 5px;
  padding-left: 10px;
  padding-right: 10px;
  white-space: nowrap;
}

.linkName:hover,
.navigationButton:hover {
  transition: all;
  transition-duration: 0.3s;
  transition-timing-function: ease-in-out;
  background-color: #f5f5f5;
  border-radius: 5px;
  width: 100%;
}
```

## Add protected routes

So now we dont expose the `Create post` item if the user is not authenticated. However, if a user navigates to that page via the url, they will still be able to access it.

To solve this, we need to add a `middleware.js` file in the root of our project.

You can read more about middleware and how it works here[https://nextjs.org/docs/pages/building-your-application/routing/middleware]

Supabase has an example that we use as base that can be found here[https://supabase.com/docs/guides/auth/auth-helpers/nextjs-pages#auth-with-nextjs-middleware]

This is the final code that should be included in the `middleware.js``

```
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";

export async function middleware(req) {
  // We need to create a response and hand it to the supabase client to be able to modify the response headers.
  const res = NextResponse.next();
  // Create authenticated Supabase Client.
  const supabase = createMiddlewareClient({ req, res });
  // Check if we have a session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Check auth condition
  if (session) {
    // Authentication successful, forward request to protected route.
    return res;
  }

  // Auth condition not met, redirect to home page.
  const redirectUrl = req.nextUrl.clone();
  redirectUrl.pathname = "/login";
  redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/create-post", "/blog/:path*/edit"],
};
```

This function basically runs the `middleware` function if the url matches the config matcher url that is included.
