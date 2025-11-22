<script>
  import { Router, Route } from 'svelte-routing';
  import { Toaster } from 'svelte-sonner';
  import Home from './pages/Home/Home.svelte';
  import Members from './pages/Members/Members.svelte';
  import Login from './pages/Login/Login.svelte';
  import ForgotPassword from './pages/ForgotPassword/ForgotPassword.svelte';
  import ResetPassword from './pages/ResetPassword/ResetPassword.svelte';
  import PrivateRoute from './components/PrivateRoute.svelte';
  import Header from './components/Header.svelte';
  import Footer from './components/Footer.svelte';
</script>

<Toaster />

<Router>
  <Header />

  <main>
    <Route path='/'><Home /></Route>
    <Route path='/members'>
      <PrivateRoute>
        <Members />
      </PrivateRoute>
    </Route>
    <Route path='/login'><Login /></Route>
    <Route path='/forgot-password'><ForgotPassword /></Route>
    <Route path='/reset-password'><ResetPassword /></Route>
  </main>

  <Footer />
</Router>