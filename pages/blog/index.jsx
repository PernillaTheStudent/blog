import Link from "next/link";
import styles from "./blog.module.css";
import Heading from "@components/heading";

import useSWR from "swr";
import { getPosts, postsCacheKey } from "../../api-routes/posts";

import { useUser } from "@supabase/auth-helpers-react";

export default function Blog() {
  const {
    data: { data = [] } = {},
    error,
    isLoading } = useSWR(postsCacheKey, getPosts);
  
  const user = useUser();

  if (error) {
    return <div>Error loading post</div>;
  }

  if (isLoading) {
    return <div>Loading post...</div>;
  }
  
  return (
    <section>
      <Heading>Blog</Heading>
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
