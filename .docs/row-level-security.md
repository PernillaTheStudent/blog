# Authorization part 2 (row level security)

Docs regarding row level security:
https://supabase.com/docs/guides/auth/row-level-security

The whole demo is recorded and i highy recommend to watch it unless you haven't already.
This is a text summary of what we have done in order to add row level security and protected routes using supabase auth & a middleware file.

## Change the supabase client:

In order for our client to have access to the session, we need to change our instance of supabase in order for it to work with the Auth provided by supabase.

In our `supabaseClient.js` file, we need to change our previous implementation from using `createClient` to `createPagesBrowserClient` instead.

This is how the updated `supabaseClient.js` should look like:

```
import { createPagesBrowserClient } from "@supabase/auth-helpers-nextjs";
export const supabase = createPagesBrowserClient();
```

## Import our updated supabase client to the SessionContextProvider:

In our `_app.tsx` file, we currently have a supabase instance looking like this:
`const [supabaseClient] = useState(() => createPagesBrowserClient())`

We want to remove this and import our `createPagesBrowserClient()` instance from our `supabaseClient.js` instead.

Our `_app.tsx` file should look like this:

```
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import RootLayout from "../components/root-layout";

import { SessionContextProvider } from "@supabase/auth-helpers-react";

import { supabase } from "@/lib/supabaseClient";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <SessionContextProvider
        supabaseClient={supabase}
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

## Next, we need to create our policies.

For each table, we can customize the policies in order to prevent users without authorization to change rows in our database.

Open the SQL editor and paste in these policies:

```
-- Create a policy that allows everyone to select posts
CREATE POLICY select_posts ON posts
  FOR SELECT
  USING (true);

-- Create a policy that allows users to update their own posts
CREATE POLICY update_own_posts ON posts
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create policy "Authenticated users can insert into posts" on posts for insert
with
  check (auth.uid () is not null);

-- Create a policy that allows users to delete their own posts
CREATE POLICY delete_own_posts ON posts
  FOR DELETE
  USING (user_id = auth.uid());

  -- Create a policy that allows everyone to select comments
CREATE POLICY select_comments ON comments
  FOR SELECT
  USING (true);

-- Create a policy that allows everyone to insert comments
CREATE POLICY insert_comments ON comments
  FOR INSERT
  WITH CHECK (true);

-- Create a policy that allows only the authenticated user who created the post to delete comments
CREATE POLICY delete_own_comments ON comments
  FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM posts
    WHERE posts.id = comments.post_id
    AND posts.user_id = auth.uid()
  ));

-- Create a policy that disallows updates to comments
CREATE POLICY no_update_comments ON comments
  FOR UPDATE
  USING (false);
```

## Prevent unauthorized users to visit the edit page.

We did some changes to the edit page in order to prevent users to visit the /edit path unless they are the author of the blog post.

I went through the whole process in the video recording in more depth, but here is the final code for it using `getServerSideProps`.

```
import { useRouter } from "next/router";
import BlogEditor from "../../../../components/blog-editor";

import { getPost, postsCacheKey } from "@/api-routes/posts";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { createSlug } from "../../../../utils/createSlug";
import { editPost } from "../../../../api-routes/posts";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";

export default function EditBlogPost() {
  const router = useRouter();
  /* Use this slug to fetch the post from the database */
  const { slug } = router.query;
  const {
    data: { data: post = {} } = {},
    error,
    isLoading,
  } = useSWR(slug ? `${postsCacheKey}${slug}` : null, () => getPost({ slug }));
  const { trigger: editPostTrigger } = useSWRMutation(
    `${postsCacheKey}${slug}`,
    editPost
  );

  const handleOnSubmit = async ({ editorContent, titleInput, image }) => {
    const updatedSlug = createSlug(titleInput);

    const updatedPost = {
      id: post.id,
      body: editorContent,
      title: titleInput,
      slug: updatedSlug,
    };

    const { data, error } = await editPostTrigger(updatedPost);
    console.log({ data, error });
  };

  if (isLoading) {
    return "...loading";
  }

  return (
    <BlogEditor
      heading="Edit blog post"
      title={post.title}
      src={post.image}
      alt={post.title}
      content={post.body}
      buttonText="Save changes"
      onSubmit={handleOnSubmit}
    />
  );
}

export const getServerSideProps = async (ctx) => {
  const supabase = createPagesServerClient(ctx);
  const { slug } = ctx.params;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { data } = await supabase
    .from("posts")
    .select()
    .single()
    .eq("slug", slug);

  const isAuthor = data.user_id === session.user.id;

  if (!isAuthor) {
    return {
      redirect: {
        destination: `/blog/${slug}`,
        permanent: true,
      },
    };
  }
  return {
    props: {},
  };
};

```

And this is the editPost function in the `/api-routes/posts.js`

```
export const editPost = async (_, { arg: updatedPost }) => {
  const { data, error, status } = await supabase
    .from("posts")
    .update(updatedPost)
    .eq("id", updatedPost.id)
    .select()
    .single();

  return { data, error, status };
};
```

## IMPORTANT!

In order to be able to visit /edit on a specific blog post, YOU (as the authenticated user) need to be the user_id assigned to the column connected to the post.

Also, for every new blog post that is created, a user_id needs to be included in the insert object to avoid it to be NULL.

This snipped below is how `/create-post/index.jsx` should look like.
We utilize the `useUser()` hook and include the `user_id: user.id` to the `newPost`constant.
This makes sure that there will always be user assigned to a post.

```
import BlogEditor from "@/components/blog-editor";
import { createSlug } from "@/utils/createSlug";
import useSWRMutation from "swr/mutation";
import { postsCacheKey, addPost } from "../../api-routes/posts";
import { useRouter } from "next/router";
import { useUser } from "@supabase/auth-helpers-react";

export default function CreatePost() {
  const router = useRouter();
  const user = useUser();

  const { trigger: addPostTrigger } = useSWRMutation(postsCacheKey, addPost);

  const handleOnSubmit = async ({ editorContent, titleInput, image }) => {
    const slug = createSlug(titleInput);

    const newPost = {
      body: editorContent,
      title: titleInput,
      slug,
      user_id: user.id,
    };
    const { error } = await addPostTrigger(newPost);

    if (!error) {
      router.push(`/blog/${slug}`);
    }
  };

  return (
    <BlogEditor
      heading="Create post"
      onSubmit={handleOnSubmit}
      buttonText="Upload post"
    />
  );
}

```
