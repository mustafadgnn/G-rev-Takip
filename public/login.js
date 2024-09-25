const USERS_URL = 'http://localhost:3000/users';
const TASKS_URL = 'http://localhost:3000/tasks';

let tasks = []; // Global görev dizisi

// Kişileri listeleme fonksiyonu
async function loadUsers() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token eksik. Lütfen tekrar giriş yapın.');
        }

        const response = await fetch(USERS_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Kullanıcılar yüklenemedi.');

        const users = await response.json();
        const userList = document.getElementById('user-list');
        if (!userList) {
            console.error('user-list (tablo) elementi bulunamadı!');
            return;
        }

        userList.innerHTML = ''; // Eski verileri temizle
        document.getElementById('user-table').style.display = 'table';
        document.getElementById('task-table').style.display = 'none';
        document.getElementById('create-task-form').style.display = 'none';
        document.getElementById('kisilerBlock').style.display = 'block';
        document.getElementById('gorevlerBlock').style.display = 'none';

        users.forEach(user => {
            const row = document.createElement('tr');
            const idCell = document.createElement('td');
            idCell.textContent = user.id;
            row.appendChild(idCell);

            const nameCell = document.createElement('td');
            nameCell.textContent = user.name;
            row.appendChild(nameCell);

            userList.appendChild(row);
        });
    } catch (error) {
        console.error('Kullanıcılar yüklenirken hata oluştu:', error);
    }
}

// Görevleri listeleme fonksiyonu
async function loadTasks() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Token eksik. Lütfen tekrar giriş yapın.');
        }

        const response = await fetch(TASKS_URL, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Görevler yüklenemedi.');

        tasks = await response.json();
        const taskList = document.getElementById('task-list');
        if (!taskList) {
            console.error('task-list (tablo) elementi bulunamadı!');
            return;
        }

        taskList.innerHTML = ''; // Eski verileri temizle
        document.getElementById('task-table').style.display = 'table';
        document.getElementById('user-table').style.display = 'none';
        document.getElementById('create-task-form').style.display = 'none';
        document.getElementById('kisilerBlock').style.display = 'none';
        document.getElementById('gorevlerBlock').style.display = 'block';

        tasks.forEach(task => {
            const row = document.createElement('tr');
            row.dataset.taskId = task.id;

            const idCell = document.createElement('td');
            idCell.textContent = task.id;
            row.appendChild(idCell);

            const titleCell = document.createElement('td');
            titleCell.textContent = task.title;
            row.appendChild(titleCell);

            const descCell = document.createElement('td');
            descCell.textContent = task.description;
            row.appendChild(descCell);

            const completedCell = document.createElement('td');
            completedCell.textContent = task.completed ? 'Tamamlanmış' : 'Tamamlanmamış';
            completedCell.style.color = task.completed ? 'red' : 'black'; // Duruma göre renk
            row.appendChild(completedCell);

            const assignedCell = document.createElement('td');
            assignedCell.textContent = task.assigned_user_name || 'Atanmamış';
            row.appendChild(assignedCell);

            taskList.appendChild(row);
        });
    } catch (error) {
        console.error('Görevler yüklenirken hata oluştu:', error);
    }
}

// Diğer fonksiyonlar burada devam ediyor...
document.getElementById('task-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Form gönderimini engelle
    createTask(); // Görev oluşturma fonksiyonunu çağır
});
document.getElementById('delete-task-btn').addEventListener('click', function(event) {
    deleteTask(); // Görev silme fonksiyonunu çağır
});
// Görev oluşturma fonksiyonu
// Görev oluşturma fonksiyonu
async function createTask() {
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const assignedTo = document.getElementById('assigned-to').value;

    if (!title || !description) {
        alert('Lütfen başlık ve açıklamayı doldurun.');
        return;
    }

    const taskData = {
        title: title,
        description: description,
        assigned_to: assignedTo || null
    };

    try {
        const response = await fetch(TASKS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) throw new Error('Görev oluşturulamadı.');

        alert('Görev başarıyla oluşturuldu.');
        document.getElementById('task-form').reset();
        document.getElementById('create-task-form').style.display = 'none'; // Formu gizle
        loadTasks(); // Görev listesini yenile
    } catch (error) {
        console.error('Görev oluşturulurken bir hata oluştu:', error.message);
        alert(error.message);
    }
}

// Görev oluştur butonuna tıklayınca formu gösterme
document.getElementById('create-task-btn').addEventListener('click', function() {
    document.getElementById('create-task-form').style.display = 'block'; // Formu göster
        document.getElementById('task-table').style.display = 'none'; // Görev tablosunu gizle
        document.getElementById('user-table').style.display = 'none'; // Kişi tablosunu gizle        
        document.getElementById('kisilerBlock').style.display = 'none';
        document.getElementById('gorevlerBlock').style.display = 'none';
        
        loadUsersForAssignment(); // Kullanıcıları yükle
});
document.getElementById('task-update-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Form gönderimini engelle
    updateTask(); // Görev güncelleme fonksiyonunu çağır
});

// Görev güncelleme fonksiyonu
async function updateTask() {
    const id = document.getElementById('update-task-id').value;
    const title = document.getElementById('update-task-title').value.trim();
    const description = document.getElementById('update-task-description').value.trim();
    const assignedTo = document.getElementById('update-assigned-to').value;
    const completed = document.getElementById('update-task-completed').value;

    if (!title || !description) {
        alert('Lütfen başlık ve açıklamayı doldurun.');
        return;
    }

    const taskData = {
        title: title,
        description: description,
        assigned_to: assignedTo || null,
        completed: completed
    };

    try {
        const response = await fetch(`${TASKS_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) throw new Error('Görev güncellenemedi.');

        alert('Görev başarıyla güncellendi.');
        document.getElementById('task-update-modal').style.display = 'none'; // Modalı kapat
        loadTasks(); // Görev listesini yenile
    } catch (error) {
        console.error('Görev güncellenirken bir hata oluştu:', error.message);
        alert(error.message);
    }
}

// Görev silme fonksiyonu
async function deleteTask() {
    const id = document.getElementById('update-task-id').value;

    try {
        const response = await fetch(`${TASKS_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Görev silinemedi.');

        alert('Görev başarıyla silindi.');
        document.getElementById('task-update-modal').style.display = 'none'; // Modalı kapat
        loadTasks(); // Görev listesini yenile
    } catch (error) {
        console.error('Görev silinirken bir hata oluştu:', error.message);
        alert(error.message);
    }
}




// Kişiler ve Görevler butonlarına tıklayınca listeleme
document.getElementById('kisilerMenuButton').addEventListener('click', function(event) {
    event.preventDefault();
    loadUsers();
});

document.getElementById('gorevlerMenuButton').addEventListener('click', function(event) {
    event.preventDefault();
    loadTasks();
});

// Görev satırına çift tıklayınca modal açma
document.getElementById('task-list').addEventListener('dblclick', function(event) {
    const row = event.target.closest('tr');
    const taskId = row.dataset.taskId;
    const task = tasks.find(t => t.id == taskId);

    if (task) {
        document.getElementById('update-task-title').value = task.title;
        document.getElementById('update-task-description').value = task.description;
        document.getElementById('update-task-completed').value = task.completed ? 1 : 0;
        document.getElementById('update-task-id').value = task.id;
        document.getElementById('update-assigned-to').value = task.assigned_to || '';

        // Atanan kişi listesi güncelleniyor
        loadUsersForAssignment(task.assigned_to);

        document.getElementById('task-update-modal').style.display = 'block';
    } else {
        console.error('Görev bulunamadı:', taskId);
    }
});
// Atanacak kullanıcıları yükleme fonksiyonu
async function loadUsersForAssignment(selectedUserId = null) {
  try {
      const token = localStorage.getItem('token');
      if (!token) {
          throw new Error('Token eksik. Lütfen tekrar giriş yapın.');
      }

      const response = await fetch(USERS_URL, {
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });

      const users = await response.json();
      const select = document.getElementById('assigned-to');
      const updateSelect = document.getElementById('update-assigned-to');
      select.innerHTML = '<option value="">Seçiniz</option>';
      updateSelect.innerHTML = '<option value="">Seçiniz</option>'; // Güncelleme modalı için de listeyi temizle

      users.forEach(user => {
          const option = document.createElement('option');
          option.value = user.id;
          option.textContent = user.name;
          select.appendChild(option);

          const updateOption = document.createElement('option');
          updateOption.value = user.id;
          updateOption.textContent = user.name;
          updateSelect.appendChild(updateOption);
      });

      // Eğer bir kullanıcı atanmışsa, bu kullanıcıyı seçili hale getir
      if (selectedUserId) {
          updateSelect.value = selectedUserId;
      }
  } catch (error) {
      console.error('Kullanıcılar yüklenirken bir hata oluştu:', error);
  }
}
