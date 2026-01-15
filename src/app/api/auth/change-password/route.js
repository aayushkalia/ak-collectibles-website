import { getServerSession } from "next-auth";
import { authOptions } from "../../[...nextauth]/route";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "Current and New passwords are required" },
        { status: 400 }
      );
    }

    // Get user from DB to get the hashed password
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(session.user.id);

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Verify current password
    const passwordsMatch = await bcrypt.compare(currentPassword, user.password);

    if (!passwordsMatch) {
        return NextResponse.json({ message: "Incorrect current password" }, { status: 400 });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update DB
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashedNewPassword, user.id);

    return NextResponse.json({ message: "Password updated successfully" });

  } catch (error) {
    console.error("Change Password Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
