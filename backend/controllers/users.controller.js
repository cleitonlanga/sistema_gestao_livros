import User from "../models/user.model.js";
import { generateTokenAndSetCookeie } from "../lib/generateToken.js";
import bcrypt from "bcryptjs";

export const createUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    if (!emailRegex.test(email)) {
      return res.status(400).send("Invalid email");
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).send("Email already exists");
    }
    if (password.length < 6) {
      return res
        .status(400)
        .send("Password must be at least 6 characters long");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = new User({ name, email, password: hashedPassword });

    if (newUser) {
      generateTokenAndSetCookeie(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      });
    } else {
      res.status(400).json({ error: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ "Error creating user": error.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    const isPassWordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    if (!user || !isPassWordCorrect) {
      return res.status(400).send("Invalid credentials");
    }

    generateTokenAndSetCookeie(user._id, res);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ "Error logging in": error.message });
  }
};

export const getMe = async (req, res) => {
  const userId = req.user._id;
  try {
    const user = await User.findById(userId).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ "Error getting user": error.message });
  }
};

export const updateUser = async (req, res) => {
  const { name, email, newPassword, currentPassword } = req.body;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;

    if (newPassword && currentPassword) {
      const isPassWordCorrect = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isPassWordCorrect) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters long" });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    await user.save();

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: `Error updating user: ${error.message}` });
  }
};

export const deleteUser = async (req, res) => {
  const userId = req.params.id;

  const isSuperUser = req.user.isSuperUser;
  const isAdmin = req.user.role === "admin";
  try {
    if (!isSuperUser && !isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ Error: "User not found" });
    }
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ "Error deleting user": error.message });
  }
};

export const createSuperUser = async (req, res) => {
  const superUserExists = await User.findOne({ isSuperUser: true });

  try {
    if (superUserExists) {
      return res.status(400).json({ message: "Super User already exists" });
    }
    const superUser = new User({
      name: "Admin",
      password: "admin1206",
      role: "admin",
      email: "admin@gmail.com",
      isSuperUser: true,
    });
    const salt = await bcrypt.genSalt(10);
    superUser.password = await bcrypt.hash(superUser.password, salt);
    await superUser.save();
    res.status(201).json({ message: "Super User created successfully" });
  } catch (error) {
    res.status(500).json({ "Error creating super user": error.message });
  }
};

export const createAdmin = async (req, res) => {
  const isSuperUser = req.user.isSuperUser;
  const { name, password, email } = req.body;

  try {
    if (!isSuperUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = new User({
      name,
      password: hashedPassword,
      email,
      role: "admin",
      isSuperUser: false,
    });

    await newAdmin.save();
    res.status(201).json({ message: "Admin created successfully" });
  } catch (error) {
    res.status(500).json({ "Error creating admin": error.message });
  }
};

export const promoteAdmin = async (req, res) => {
  const isSuperUser = req.user.isSuperUser;
  const { id } = req.params;

  try {
    if (!isSuperUser) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role === "admin") {
      return res.status(400).json({ message: "User is already an admin" });
    }
    user.role = "admin";
    await user.save();
    res.status(200).json({ message: "User promoted to admin" });
  } catch (error) {
    res.status(500).json({ "Error promoting admin": error.message });
  }
};
