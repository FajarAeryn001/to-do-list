
            // Mendapatkan elemen DOM
        const taskInput = document.getElementById('taskInput');
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskList = document.getElementById('taskList');

        // Array untuk menyimpan daftar tugas
        // Setiap tugas adalah objek: { id: number, text: string, completed: boolean }
        let tasks = JSON.parse(localStorage.getItem('tasks')) || []; // Memuat tugas dari localStorage, atau array kosong jika tidak ada

        // Fungsi untuk menyimpan tugas ke localStorage
        function saveTasks() {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }

        // Fungsi untuk merender (menampilkan) semua tugas
        function renderTasks() {
            taskList.innerHTML = ''; // Mengosongkan daftar sebelum merender ulang

            if (tasks.length === 0) {
                taskList.innerHTML = '<li class="text-center text-gray-500 py-4">Tidak ada tugas. Tambahkan satu!</li>';
                return;
            }

            tasks.forEach((task, index) => { // Menambahkan 'index' untuk nomor urut
                const listItem = document.createElement('li');
                listItem.dataset.id = task.id; // Menyimpan ID tugas di elemen DOM

                listItem.className = `task-item ${task.completed ? 'completed' : ''}`;

                // Menambahkan ikon centang jika tugas selesai
                const checkmarkIcon = task.completed ? `
                    <svg class="checkmark-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path fill-rule="evenodd" d="M2.75 12.001a.75.75 0 01.75-.75h1.672a.75.75 0 01.53.22L8 14.879l5.05-5.05a.75.75 0 011.06 0l1.671 1.671a.75.75 0 010 1.06l-6.25 6.25a.75.75 0 01-1.06 0L2.75 12.001z" clip-rule="evenodd" />
                    </svg>
                ` : '';

                listItem.innerHTML = `
                    <span class="task-number">${index + 1}.</span> <!-- Menambahkan nomor urut -->
                    <span class="task-text text-lg text-gray-700">${task.text} ${checkmarkIcon}</span>
                    <div class="button-group flex items-center">
                        <button class="btn-success toggle-complete-btn">
                            ${task.completed ? 'Batal' : 'Selesai'}
                        </button>
                        <button class="btn-warning edit-btn">Edit</button>
                        <button class="btn-danger delete-btn">Hapus</button>
                    </div>
                `;

                // Menambahkan event listener untuk tombol-tombol di setiap tugas
                listItem.querySelector('.toggle-complete-btn').addEventListener('click', toggleComplete);
                listItem.querySelector('.edit-btn').addEventListener('click', editTask);
                listItem.querySelector('.delete-btn').addEventListener('click', deleteTask);

                taskList.appendChild(listItem);
            });
        }

        // Fungsi untuk menambahkan tugas baru (CREATE)
        function addTask() {
            const taskText = taskInput.value.trim(); // Menghapus spasi di awal/akhir

            if (taskText === '') {
                // Menggunakan modal kustom sebagai pengganti alert
                showCustomAlert('Tugas tidak boleh kosong!');
                return;
            }

            const newTask = {
                id: Date.now(), // ID unik berdasarkan timestamp
                text: taskText,
                completed: false
            };

            tasks.push(newTask);
            saveTasks(); // Simpan tugas setelah ditambahkan
            renderTasks(); // Render ulang daftar tugas
            taskInput.value = ''; // Mengosongkan input field
        }

        // Fungsi untuk mengubah status selesai/belum selesai tugas (UPDATE - complete status)
        function toggleComplete(event) {
            const listItem = event.target.closest('.task-item');
            const taskId = parseInt(listItem.dataset.id);

            tasks = tasks.map(task =>
                task.id === taskId ? { ...task, completed: !task.completed } : task
            );
            saveTasks(); // Simpan tugas setelah diupdate
            renderTasks(); // Render ulang daftar tugas
        }

        // Fungsi untuk mengedit teks tugas (UPDATE - text)
        function editTask(event) {
            const listItem = event.target.closest('.task-item');
            const taskId = parseInt(listItem.dataset.id);
            const taskTextSpan = listItem.querySelector('.task-text');
            const currentText = taskTextSpan.textContent.replace(/<svg.*<\/svg>/s, '').trim(); // Hapus SVG dari teks sebelum edit

            // Ganti span teks dengan input field
            const editInput = document.createElement('input');
            editInput.type = 'text';
            editInput.value = currentText;
            editInput.className = 'edit-input'; // Kelas Tailwind untuk styling
            taskTextSpan.replaceWith(editInput);

            editInput.focus(); // Fokus pada input field

            // Buat tombol "Simpan" dan "Batal"
            const saveBtn = document.createElement('button');
            saveBtn.textContent = 'Simpan';
            saveBtn.className = 'btn-primary save-edit-btn';

            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Batal';
            cancelBtn.className = 'btn-secondary cancel-edit-btn';

            const buttonGroup = listItem.querySelector('.button-group');
            // Sembunyikan tombol asli dan tambahkan tombol baru
            Array.from(buttonGroup.children).forEach(btn => btn.style.display = 'none');
            buttonGroup.appendChild(saveBtn);
            buttonGroup.appendChild(cancelBtn);

            // Event listener untuk tombol "Simpan"
            saveBtn.addEventListener('click', () => {
                const newText = editInput.value.trim();
                if (newText === '') {
                    showCustomAlert('Tugas tidak boleh kosong!');
                    return;
                }
                tasks = tasks.map(task =>
                    task.id === taskId ? { ...task, text: newText } : task
                );
                saveTasks();
                renderTasks(); // Render ulang untuk menampilkan perubahan
            });

            // Event listener untuk tombol "Batal"
            cancelBtn.addEventListener('click', () => {
                renderTasks(); // Cukup render ulang untuk mengembalikan tampilan semula
            });

            // Handle Enter key to save
            editInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    saveBtn.click(); // Simulasikan klik tombol simpan
                }
            });
        }

        // Fungsi untuk menghapus tugas (DELETE)
        function deleteTask(event) {
            const listItem = event.target.closest('.task-item');
            const taskId = parseInt(listItem.dataset.id);

            // Filter array tugas untuk menghapus tugas yang sesuai dengan ID
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasks(); // Simpan tugas setelah dihapus
            renderTasks(); // Render ulang daftar tugas
        }

        // Fungsi untuk menampilkan alert kustom (pengganti alert() bawaan)
        function showCustomAlert(message) {
            const alertModal = document.createElement('div');
            alertModal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50';
            alertModal.innerHTML = `
                <div class="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full text-center">
                    <p class="text-lg font-semibold text-gray-800 mb-4">${message}</p>
                    <button id="closeAlertBtn" class="btn-primary px-4 py-2 rounded-lg">OK</button>
                </div>
            `;
            document.body.appendChild(alertModal);

            document.getElementById('closeAlertBtn').addEventListener('click', () => {
                alertModal.remove();
            });
        }

        // Event listener untuk tombol "Tambah Tugas"
        addTaskBtn.addEventListener('click', addTask);

        // Event listener untuk menekan Enter di input field
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTask();
            }
        });

        // Panggil renderTasks saat halaman dimuat untuk menampilkan tugas yang ada
        document.addEventListener('DOMContentLoaded', renderTasks);
