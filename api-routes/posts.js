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

	// const { data, error, status } = await supabase
	// 	.from("posts")
	// 	.select("*")
	// 	.single()
	// 	.eq("slug", slug);
	// return { data, error, status };
};

// export const addPost = async (_, { arg: newPost }) => {
export const addPost = async (_, args) => {  // _ = postsCacheKey
  // create a function that takes in the uploaded image from the client
  // upload it to our bucket
  // get the public url and return it
  
  // console.log(newPost);
  console.log({args});
  const { arg: newPost } = args;
  console.log("newPost", newPost);

  let image = "";

  if (newPost?.image) {
    const { publicUrl, error } = await uploadImage(newPost.image);

    if (!error) {
      image = publicUrl;
    }
  }

  console.log(image)

  //Handle add post here
  const { data, error, status } = await supabase
    .from("posts")
    // .insert(newPost)
    .insert({...newPost, image})  // 
    .select()
    .single()

    return { data, error, status };
};

export const removePost = () => {
  //Handle remove post here
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

  //Handle edit post here
  const { data, error, status } = await supabase
    .from("posts")
    .update({...updatedPost, image })
    .eq("id", updatedPost.id)
    .select()
    .single();

    return { data, error, status };
};
