import Link from "next/link";
import styles from "./blog.module.css";
import Heading from "@components/heading";

import useSWR from "swr";
import { getPosts, postsCacheKey } from "../../api-routes/posts";
// import { getPosts } from "../../api-routes/posts";

import { useUser } from "@supabase/auth-helpers-react";

const mockData = [
  {
    id: "123",
    title: "Community-Messaging Fit",
    slug: "community-messaging-fit",
    createdAt: "2022-02-15",
    body: "<p>This is a good community fit!</p>",
  },
  {
    id: "1234",
    title: "Why you should use a react framework",
    slug: "why-you-should-use-react-framework",
    createdAt: "2022-02-12",
    body: "<p>This is a good community fit!</p>",
  },
];

export default function Blog() {
  const {
    data: { data = [] } = {},
    error,
    isLoading } = useSWR(postsCacheKey, getPosts);
  // const { data: swrData, error, isLoading } = useSWR(postsCacheKey, getPosts);
  console.log({ data });

  const user = useUser();
  console.log(user);

  if (error) {
    return <div>Error loading post</div>;
  }

  if (isLoading) {
    return <div>Loading post...</div>;
  }

  
  return (
    <section>
      <Heading>Blog</Heading>
      {/* {mockData.map((post) => ( */}
      {data?.map((post) => (
        <Link
          key={post.slug}
          className={styles.link}
          href={`/blog/${post.slug}`}
        >
          <div className="w-full flex flex-col">
            <p>{post.title}</p>
            <time className={styles.date}>{post.created_at}</time>
          </div>
        </Link>
      ))}
    </section>
  );
}
