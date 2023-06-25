import { supabase } from "../lib/supabaseClient";

export const commentsCacheKey = "/api/blogs";

export const getComments = async (postId) => {
  console.log("inside getComments")
  const { data, error, status } = await supabase
    .from("comments")
    .select()
    .eq("post_id", postId);

  return { data, error, status };
};

export const addComment = async (_, { arg: newComment }) => {
  console.log("inside addComment");
  const { data, error, status } = await supabase
    .from("comments")
    .insert(newComment)
    .select()
    .single()
    .eq("post_id", newComment.post_id)

  return { data, error, status };
};

export const removeComment = async (_, { arg: commentId }) => {
  console.log("inside removeComment", { commentId })
  const { error, status } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId)

  return { error, status };
};
