const API = '/api/users';
const $tbody = document.getElementById('tbody');
const $form = document.getElementById('user-form');
const $name = document.getElementById('name');
const $email = document.getElementById('email');
const $msg = document.getElementById('msg');

function flash(text, ok = false) {
  $msg.textContent = text;
  $msg.className = ok ? 'msg success' : 'msg';
  if (text) setTimeout(() => { $msg.textContent = ''; }, 3000);
}

async function load() {
  try {
    const res = await fetch(API);
    const data = await res.json();
    render(data);
  } catch (err) {
    flash('Erro ao carregar lista');
  }
}

function render(users) {
  $tbody.innerHTML = users.map(u => `
    <tr>
      <td>${u.id}</td>
      <td>${u.name}</td>
      <td>${u.email}</td>
      <td><button data-id="${u.id}" class="del">Excluir</button></td>
    </tr>
  `).join('');
}

$form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = $name.value.trim();
  const email = $email.value.trim();
  if (!name || !email) {
    flash('Preencha nome e e-mail');
    return;
  }
  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    });
    if (res.ok) {
      flash('Usuário cadastrado com sucesso!', true);
      $name.value = '';
      $email.value = '';
      await load();
    } else {
      const err = await res.json().catch(() => ({ error: 'erro' }));
      flash(err.error || 'Erro ao salvar');
    }
  } catch (err) {
    flash('Erro de conexão');
  }
});

$tbody.addEventListener('click', async (e) => {
  const btn = e.target.closest('.del');
  if (!btn) return;
  const id = btn.getAttribute('data-id');
  const yes = confirm('Deseja excluir este usuário?');
  if (!yes) return;
  try {
    const res = await fetch(`${API}/${id}`, { method: 'DELETE' });
    if (res.status === 204) {
      flash('Usuário excluído.', true);
      await load();
    } else {
      flash('Erro ao excluir.');
    }
  } catch (err) {
    flash('Erro de conexão');
  }
});

load(); // Carrega a lista na inicialização