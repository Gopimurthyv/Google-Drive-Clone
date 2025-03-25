"use server";

import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs"; 
import { avatarPlaceholderUrl } from "@/constants";
import { revalidatePath } from "next/cache";
import { parseStringify } from "@/lib/utils";

export const signUpAction = async (formData: FormData) => {
  
  const fullname = formData.get("fullname")?.toString();
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  console.log({ fullname, email, password }); // Debugging output

  if (!fullname || !email || !password) {
    return encodedRedirect("error", "/sign-up", "All fields are required");
  }

  // Hash the password before storing
  const hashedPassword = await bcrypt.hash(password, 10);

  // Sign up the user in Supabase Auth
  const {data, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (authError) {
    return encodedRedirect("error", "/sign-up", authError.message);
  }

    // Ensure we have a valid user ID from auth.users
  const userId = data?.user?.id;
  if (!userId) {
    console.error("User ID not found after signup");
    return;
  }
  // Insert user into the `users` table
  const { error: dbError } = await supabase.from("users").insert([
    {id:userId, fullname, email, password: hashedPassword , avatar: avatarPlaceholderUrl},
  ]);

  if (dbError) {
    return encodedRedirect("error", "/sign-up", "User sign-up failed.");
  }

  return encodedRedirect(
    "success",
    "/sign-up",
    "Thanks for signing up! Please check your email for verification."
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const supabase = await createClient();

  if (!email || !password) {
    return encodedRedirect("error", "/sign-in", "Email and password required");
  }

  // Fetch user from `users` table
  const { data: user, error } = await supabase
    .from("users")
    .select("id, password")
    .eq("email", email)
    .single();

  if (error || !user) {
    return encodedRedirect("error", "/sign-in", "Invalid credentials");
  }

  // Compare hashed password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return encodedRedirect("error", "/sign-in", "Invalid credentials");
  }

  // Sign in the user in Supabase Auth (optional)
  const { error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return encodedRedirect("error", "/sign-in", authError.message);
  }

  return redirect("/");
};


export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const origin = (await headers()).get("origin");
  const callbackUrl = formData.get("callbackUrl")?.toString();

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      "/forgot-password",
      "Could not reset password",
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    "/forgot-password",
    "Check your email for a link to reset your password.",
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password and confirm password are required",
    );
  }

  if (password !== confirmPassword) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Passwords do not match",
    );
  }

  const { error } = await supabase.auth.updateUser({
    password: password,
  });

  if (error) {
    encodedRedirect(
      "error",
      "/protected/reset-password",
      "Password update failed",
    );
  }

  encodedRedirect("success", "/protected/reset-password", "Password updated");
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect("/sign-in");
};

export const getCurrentUser = async () => {
  // ✅ Await the Supabase client creation
  const supabase = await createClient();

  // ✅ Get currently authenticated user from Supabase Auth
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return null; // Return null if no user is found

  // ✅ Fetch user details from the 'users' table
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("*") // Select all fields or specify required fields like "fullname, email"
    .eq("id", user.id)
    .single(); // Fetch only one user

  if (userError || !userData) return null;

  return userData; // Return the user data from the database
};

//***Files_Section***


type GetFilesProps = {
  types?: string[];
  searchText?: string;
  sort?: string;
  limit?: number;
};

export type FileItem = {
  id: string;
  name: string;
  url: string;
  type: string;
  extension: string;
  size: number;
  created_at: string; // Ensure this field is in your database
  owner: { fullName: string } | string; // Fix owner type issue
};

interface RenameFileProps {
  fileId: string;
  name: string;
  extension: string;
  path: string;
}

interface UpdateFileUsersProps {
  fileId: string;
  emails: string[];
  path: string;
}

interface DeleteFileProps {
  fileId: string;
  bucketFileId: string;
  path: string;
}


const handleError = (error: unknown, message: string) => {
  console.log(error, message);
  throw error;
};

const createQueries = (
  supabase: any,
  currentUser: any, // User object from Supabase
  types: string[],
  searchText: string,
  sort: string,
  limit?: number
) => {
  let query = supabase.from("files").select("*");

  // Filter files: owned by user OR shared with user
  query = query.or(`owner.eq.${currentUser.id}, users.ilike.%${currentUser.email}%`);

  // Filter by file types
  if (types.length > 0) {
    query = query.in("type", types);
  }

  // Search by file name
  if (searchText) {
    query = query.ilike("name", `%${searchText}%`);
  }

  // Apply sorting
  if (sort) {
    const [sortBy, orderBy] = sort.split("-");
    query = orderBy === "asc"
      ? query.order(sortBy, { ascending: true })
      : query.order(sortBy, { ascending: false });
  }

  // Limit results
  if (limit) {
    query = query.limit(limit);
  }

  return query; // ✅ Return query builder, not a promise
};

export const getFiles = async ({
  types = [],
  searchText = "",
  sort = "created_at-desc",
  limit,
}: GetFilesProps) => {
  const supabase = await createClient();

  try {
    // Get current user
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) throw new Error("User not found");

    const userId = authData.user.id;

    let query = supabase.from("files").select("*").eq("owner", userId);

    // Apply filters
    if (types.length > 0) query = query.in("type", types);
    if (searchText) query = query.ilike("name", `%${searchText}%`);
    if (limit) query = query.limit(limit);

    // Fix sorting
    const [sortBy, orderBy] = sort.split("-");
    const isAscending = orderBy === "asc";

    query = query.order(sortBy, { ascending: isAscending });

    const { data, error } = await query;

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error("Failed to get files:", error);
    return [];
  }
};




export const renameFile = async ({ fileId, name, extension, path }: RenameFileProps) => {
  const supabase = await createClient();

  try {
    const newName = `${name}.${extension}`;
    const { data, error } = await supabase
      .from("files")
      .update({ name: newName })
      .eq("id", fileId);

    if (error) throw error;

    revalidatePath(path);
    return parseStringify(data);
  } catch (error) {
    handleError(error, "Failed to rename file");
  }
};

export const updateFileUsers = async ({ fileId, emails, path }: UpdateFileUsersProps) => {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("files")
      .update({ users: emails })
      .eq("id", fileId);

    if (error) throw error;

    revalidatePath(path);
    return parseStringify(data);
  } catch (error) {
    handleError(error, "Failed to update file users");
  }
};

export const deleteFile = async ({ fileId, bucketFileId, path }: DeleteFileProps) => {
  const supabase = await createClient();

  try {
    // Delete file record from DB
    const { error: dbError } = await supabase.from("files").delete().eq("id", fileId);
    if (dbError) throw dbError;

    // Delete actual file from storage
    const { error: storageError } = await supabase.storage.from("your-bucket-name").remove([bucketFileId]);
    if (storageError) throw storageError;

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    handleError(error, "Failed to delete file");
  }
};
