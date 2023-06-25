import { supabase } from "../lib/supabaseClient";
import { uploadImage } from "../utils/uploadImage";
// import { supabase } from "@supabase/auth-ui-shared";

export const postsCacheKey = "/api/blogs";
// export const postsCacheKey = "/blog";

export const getPosts = async () => {
	const { data, error, status } = await supabase
		.from("posts")
		.select();
	return { data, error, status };
};

export const getPost = async (args) => {
// export const getPost = async (_, { arg: slug }) => {
//export const getPost = async (arg) => {
  console.log("inside getPost")
  const slug = args;
  // console.log("args", args)
  // console.log("this is slug:", slug);

  try {
    const { data, error, status } = await supabase
      .from("posts")
      .select()
      .single()
      .eq("slug", slug);

      // console.error("data",data)
    return { data, status };
  } catch (error) {
    console.error(error);
    // return { data: null, error: 'An error occurred', status: 500 };
    return { error: 'An error occurred', status: 500 };
  }
};

export const addPost = async (_, { arg: newPost }) => {
  // create a function that takes in the uploaded image from the client
  // upload it to our bucket
  // get the public url and return it
  let image = "";

  if (newPost?.image) {
    const { publicUrl, error } = await uploadImage(newPost.image);

    if (!error) {
      image = publicUrl;
    }
  }

  //Handle add post here
  const { data, error, status } = await supabase
    .from("posts")
    .insert({...newPost, image})  // 
    .select()
    .single()

    return { data, error, status };
};

export const removePost = async (_, {arg: postId }) => {
  // console.log("Post to delete", {postId});

  const { error, status } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)

    return { error, status };
};

export const editPost = async (_, { arg: updatedPost }) => {
  let image = updatedPost?.image ?? "";

  const isNewImage = typeof image === "object" && image !== null;

  if (isNewImage) {
    const { publicUrl, error } = await uploadImage(updatedPost.image);

    if (!error) {
      image = publicUrl;
    }
  }

  const { data, error, status } = await supabase
    .from("posts")
    .update({...updatedPost, image })
    .eq("id", updatedPost.id)
    .select()
    .single();

    return { data, error, status };
};
