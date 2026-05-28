import mongoose, { Schema, Document, Model } from "mongoose"

export interface IUser extends Document {
  username: string
  email: string
  passwordHash: string
  isVerified: boolean
  verificationCode?: string
  verificationCodeExpires?: Date
  resetCode?: string
  resetCodeExpires?: Date
  likedTracks: any[] // Array of Liked Tracks
  playlists: {
    _id: string
    name: string
    description: string
    tracks: any[]
  }[]
  createdAt: Date
  updatedAt: Date
}

const UserSchema: Schema<IUser> = new Schema(
  {
    username: {
      type: String,
      required: [true, "El nombre de usuario es obligatorio"],
      trim: true,
      minlength: [3, "El nombre de usuario debe tener al menos 3 caracteres"],
    },
    email: {
      type: String,
      required: [true, "El correo electrónico es obligatorio"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Por favor ingresa un correo electrónico válido"],
    },
    passwordHash: {
      type: String,
      required: [true, "La contraseña es obligatoria"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
    },
    verificationCodeExpires: {
      type: Date,
    },
    resetCode: {
      type: String,
    },
    resetCodeExpires: {
      type: Date,
    },
    likedTracks: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    playlists: {
      type: [
        {
          name: { type: String, required: true },
          description: { type: String, default: "" },
          tracks: { type: [Schema.Types.Mixed], default: [] },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
)

// Prevent compiling model multiple times during Next.js hot reloads
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema)

export default User
