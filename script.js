const STORAGE_KEY = 'prompt-vault-prompts';

const promptForm = document.querySelector('#prompt-form');
const titleInput = document.querySelector('#prompt-title');
const contentInput = document.querySelector('#prompt-content');
const promptList = document.querySelector('#prompt-list');
const emptyState = document.querySelector('#empty-state');
const noResults = document.querySelector('#no-results');
const promptCount = document.querySelector('#prompt-count');
const searchInput = document.querySelector('#prompt-search');
const promptModal = document.querySelector('#prompt-modal');
const modalTitle = document.querySelector('#modal-title');
const modalContent = document.querySelector('#modal-content');

function getPrompts() {
  const storedPrompts = localStorage.getItem(STORAGE_KEY);

  if (!storedPrompts) {
    return [];
  }

  try {
    const prompts = JSON.parse(storedPrompts);
    return Array.isArray(prompts) ? prompts : [];
  } catch {
    return [];
  }
}

function savePrompts(prompts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prompts));
}

function getPreview(content) {
  const words = content.trim().split(/\s+/);
  return `${words.slice(0, 24).join(' ')}${words.length > 24 ? '...' : ''}`;
}

function renderPrompts() {
  const prompts = getPrompts();
  const searchTerm = searchInput.value.trim().toLowerCase();
  const filteredPrompts = prompts.filter((prompt) => (
    prompt.title.toLowerCase().includes(searchTerm)
    || prompt.content.toLowerCase().includes(searchTerm)
  ));

  promptList.replaceChildren();
  promptCount.textContent = `${prompts.length} ${prompts.length === 1 ? 'ITEM' : 'ITEMS'}`;
  emptyState.hidden = prompts.length > 0 || searchTerm.length > 0;
  noResults.hidden = !searchTerm || filteredPrompts.length > 0;

  filteredPrompts.forEach((prompt) => {
    const card = document.createElement('article');
    card.className = 'prompt-card';

    const details = document.createElement('div');
    const title = document.createElement('h3');
    title.textContent = prompt.title;
    const preview = document.createElement('p');
    preview.className = 'prompt-preview';
    preview.textContent = getPreview(prompt.content);
    details.append(title, preview);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.type = 'button';
    deleteButton.textContent = '[ DELETE ]';
    deleteButton.addEventListener('click', () => deletePrompt(prompt.id));

    const actions = document.createElement('div');
    actions.className = 'card-actions';

    const viewButton = document.createElement('button');
    viewButton.className = 'card-action';
    viewButton.type = 'button';
    viewButton.textContent = '[ VIEW ]';
    viewButton.addEventListener('click', () => viewPrompt(prompt));

    const copyButton = document.createElement('button');
    copyButton.className = 'card-action';
    copyButton.type = 'button';
    copyButton.textContent = '[ COPY ]';
    copyButton.addEventListener('click', () => copyPrompt(prompt, copyButton));

    actions.append(viewButton, copyButton, deleteButton);
    card.append(details, actions);
    promptList.append(card);
  });
}

function viewPrompt(prompt) {
  modalTitle.textContent = prompt.title;
  modalContent.textContent = prompt.content;
  promptModal.hidden = false;
}

function closePromptModal() {
  promptModal.hidden = true;
}

async function copyPrompt(prompt, copyButton) {
  try {
    await navigator.clipboard.writeText(prompt.content);
    copyButton.textContent = '[ COPIED ]';
    window.setTimeout(() => {
      copyButton.textContent = '[ COPY ]';
    }, 1400);
  } catch {
    copyButton.textContent = '[ COPY FAILED ]';
    window.setTimeout(() => {
      copyButton.textContent = '[ COPY ]';
    }, 1400);
  }
}

function deletePrompt(promptId) {
  const prompts = getPrompts().filter((prompt) => prompt.id !== promptId);
  savePrompts(prompts);
  renderPrompts();
}

promptForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const title = titleInput.value.trim();
  const content = contentInput.value.trim();

  if (!title || !content) {
    return;
  }

  const prompts = getPrompts();
  prompts.unshift({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title,
    content
  });

  savePrompts(prompts);
  promptForm.reset();
  renderPrompts();
});

searchInput.addEventListener('input', renderPrompts);

promptModal.addEventListener('click', (event) => {
  if (event.target.matches('[data-close-modal]')) {
    closePromptModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !promptModal.hidden) {
    closePromptModal();
  }
});

renderPrompts();
