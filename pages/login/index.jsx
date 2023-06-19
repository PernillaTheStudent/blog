import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const LoginPage = () => {
  const supabaseClient = useSupabaseClient()
  const user = useUser();   // hook
  // user router-hooken som nextjs erbjuder
  const router = useRouter(); // hanterar navigering i vårt projekt
  console.log(user);

  useEffect(() => {
    if (user) {
      router.push("/");  // om det finns en användare, skicka användaren till denna url: /
    }
  }, [user, router]);  // ifall att något händer i vår user eller router, trigga det som körs här inne

  // const [data, setData] = useState()

  // useEffect(() => {
  //   async function loadData() {
  //     const { data } = await supabaseClient.from('test').select('*')
  //     setData(data)
  //   }
  //   // Only run query once user is logged in.
  //   if (user) loadData()
  // }, [user])

  // if (!user)
    return (
      // Auth komponenten hanterar alla tre flöden: sign up, reset a password, login
      <Auth
        redirectTo="http://localhost:3000/"  // kopplad till providers, så om vi loggar in via Google så används redirectTo som sista instansen
        appearance={{ theme: ThemeSupa }}
        supabaseClient={supabaseClient}
        // providers={['google', 'github']}
        providers={[]}
        socialLayout="horizontal"
      />
    )

  // return (
  //   <>
  //     <button onClick={() => supabaseClient.auth.signOut()}>Sign out</button>
  //     <p>user:</p>
  //     <pre>{JSON.stringify(user, null, 2)}</pre>
  //     {/* <p>client-side data fetching with RLS</p>
  //     <pre>{JSON.stringify(data, null, 2)}</pre> */}
  //   </>
  // )
}

export default LoginPage

// import Heading from "@components/heading";

// export default function Login() {
//   return <Heading>Login</Heading>;
// }
