import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect users from the root page to the registration form
  redirect('/form-pendaftaran');
}
