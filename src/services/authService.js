import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { auth } from './firebase'

const googleProvider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  if (!auth) {
    throw new Error('Firebase chưa được cấu hình. Vui lòng thêm config vào file .env')
  }
  const result = await signInWithPopup(auth, googleProvider)
  return result.user
}

export async function logOut() {
  if (!auth) {
    return
  }
  await signOut(auth)
}
