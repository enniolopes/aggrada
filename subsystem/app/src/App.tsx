import { useMutation } from '@tanstack/react-query';

export const App = () => {
  const loginMutation = useMutation({
    mutationFn: (userPassword: { username: string; password: string }) => {
      return fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userPassword),
      }).then((res) => {
        if (!res.ok) {
          throw new Error('Erro ao fazer login');
        }
        return res.json();
      });
    },
  });

  return (
    <div>
      <h1>Login</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const username = (
            document.getElementById('username') as HTMLInputElement
          ).value;
          const password = (
            document.getElementById('password') as HTMLInputElement
          ).value;
          loginMutation.mutate({ username, password });
        }}
      >
        <label htmlFor="username">Usuário</label>
        <input id="username" type="text" />
        <label htmlFor="password">Senha</label>
        <input id="password" type="password" />
        <button type="submit">Login</button>
      </form>
      {loginMutation.isPending && <p>Carregando...</p>}
      {loginMutation.isError && <p>{loginMutation.error.message}</p>}
      {loginMutation.isSuccess && <p>Login efetuado com sucesso</p>}
    </div>
  );
};
