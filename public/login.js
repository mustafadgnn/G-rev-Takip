const USERS_URL = 'http://localhost:3000/users';
const TASKS_URL = 'http://localhost:3000/tasks';

let tasks = []; // Global görev dizisi

// Kişileri listeleme fonksiyonu
async function loadUsers() {
    try {
        const response = await fetch(USERS_URL);
        const users = await response.json();

        const userList = document.getElementById('user-list');
        if (!userList) {
            console.error('user-list (tablo) elementi bulunamadı!');
            return;
        }

        userList.innerHTML = ''; // Eski verileri temizle
        document.getElementById('user-table').style.display = 'table'; // Kişiler tablosunu göster
        document.getElementById('task-table').style.display = 'none'; // Görevler tablosunu gizle
        document.getElementById('create-task-form').style.display = 'none'; // Görev oluşturma formunu gizle

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
        const response = await fetch(TASKS_URL);
        tasks = await response.json(); // Gelen görevleri global tasks dizisine ata

        const taskList = document.getElementById('task-list');
        if (!taskList) {
            console.error('task-list (tablo) elementi bulunamadı!');
            return;
        }

        taskList.innerHTML = ''; // Eski verileri temizle
        document.getElementById('task-table').style.display = 'table'; // Görevler tablosunu göster
        document.getElementById('user-table').style.display = 'none'; // Kişiler tablosunu gizle
        document.getElementById('create-task-form').style.display = 'none'; // Görev oluşturma formunu gizle

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
            completedCell.textContent = task.completed == 1 ? 'Tamamlanmış' : 'Tamamlanmamış';
            if (task.completed == 1) {
                completedCell.style.color = 'red'; // Tamamlanmış görevlerin durumu kırmızı
            }
            row.appendChild(completedCell);

            const assignedCell = document.createElement('td');
            assignedCell.textContent = task.assigned_user_name ? task.assigned_user_name : 'Atanmamış';
            row.appendChild(assignedCell);

            taskList.appendChild(row);
        });
    } catch (error) {
        console.error('Görevler yüklenirken hata oluştu:', error);
    }
}

// Kişiler butonuna tıklayınca kullanıcıları yükle
document.querySelector('a[href="#kisiler"]').addEventListener('click', function(event) {
    event.preventDefault();
    loadUsers();
});

// Görevler butonuna tıklayınca görevleri yükle
document.querySelector('a[href="#gorevler"]').addEventListener('click', function(event) {
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
        document.getElementById('update-task-completed').checked = task.completed == 1;
        document.getElementById('update-task-id').value = task.id;
        document.getElementById('update-assigned-to').value = task.assigned_to || '';

        // Atanan kişi listesi güncelleniyor
        loadUsersForAssignment(task.assigned_to);

        document.getElementById('task-update-modal').style.display = 'block';
    } else {
        console.error('Görev bulunamadı:', taskId);
    }
});

// Görev oluşturma ve kullanıcı atama fonksiyonları
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('create-task-btn').addEventListener('click', function() {
        document.getElementById('create-task-form').style.display = 'block'; // Formu göster
        document.getElementById('task-table').style.display = 'none'; // Görev tablosunu gizle
        document.getElementById('user-table').style.display = 'none'; // Kişi tablosunu gizle
        loadUsersForAssignment(); // Kullanıcıları yükle
    });

    document.getElementById('task-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Form gönderimini engelle
        createTask(); // Görev oluşturma fonksiyonunu çağır
    });

    document.getElementById('task-update-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Form gönderimini engelle
        updateTask(); // Görev güncelleme fonksiyonunu çağır
    });

    document.getElementById('delete-task-btn').addEventListener('click', function(event) {
        deleteTask(); // Görev silme fonksiyonunu çağır
    });
});

// Atanacak kullanıcıları yükleme fonksiyonu
async function loadUsersForAssignment(selectedUserId = null) {
  try {
      const response = await fetch(USERS_URL);
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
// Görev oluşturma fonksiyonu
async function createTask() {
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const assignedTo = document.getElementById('assigned-to').value;

    const taskData = {
        title: title,
        description: description,
        assigned_to: assignedTo || null
    };

    try {
        const response = await fetch(TASKS_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(taskData)
        });

        if (!response.ok) throw new Error('Görev oluşturulamadı.');

        alert('Görev başarıyla oluşturuldu.');
        document.getElementById('task-form').reset();
        document.getElementById('create-task-form').style.display = 'none'; // Formu gizle
        loadTasks(); // Görev listesini yenile
    } catch (error) {
        console.error('Görev oluştururken bir hata oluştu:', error.message);
        alert(error.message);
    }
}

// Görev güncelleme fonksiyonu
async function updateTask() {
  const id = document.getElementById('update-task-id').value;
  const title = document.getElementById('update-task-title').value.trim();
  const description = document.getElementById('update-task-description').value.trim();
  const assignedTo = document.getElementById('update-assigned-to').value;
  
  // Tamamlanma durumu checkbox'tan geliyor
  const completed = document.getElementById('update-task-completed').checked ? 1 : 0;

  const taskData = {
      title: title,
      description: description,
      assigned_to: assignedTo || null,
      completed: completed // Bu completed değeri gönderiliyor
  };

  try {
      const response = await fetch(`${TASKS_URL}/${id}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json'
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
            method: 'DELETE'
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
