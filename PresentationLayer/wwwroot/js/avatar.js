// Avatar preview functionality
function setupAvatarPreview() {
    const avatarInput = document.getElementById('avatar');
    const imagePreview = document.getElementById('imagePreview');

    if (avatarInput && imagePreview) {
        avatarInput.addEventListener('change', function (e) {
            const file = e.target.files[0];

            // Clear previous preview
            imagePreview.innerHTML = '';

            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    alert('Пожалуйста, выберите изображение');
                    this.value = '';
                    return;
                }

                // Validate file size (5MB limit)
                if (file.size > 5 * 1024 * 1024) {
                    alert('Размер файла не должен превышать 5MB');
                    this.value = '';
                    return;
                }

                // Create preview
                const reader = new FileReader();
                reader.onload = function (e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'cover';
                    img.style.borderRadius = '50%';
                    imagePreview.appendChild(img);
                };
                reader.readAsDataURL(file);
            }
        });
    }
}