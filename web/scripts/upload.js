window.addEventListener('load', () => {
    const img = document.createElement('img');
    img.src = '../img/download.png';
    img.className = 'download-img';

    img.onclick = () => uploadFile();

    const footer = document.getElementById('footer');
    footer.append(img);
});

function uploadFile(){
    let input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;

    input.addEventListener('change', async function(){
    const files = input.files;
    const formData = new FormData();

    for (let i = 0; i < files.length; i++){
        formData.append('files[]', files[i],files[i].webkitRelativePath || files[i].name);
    }

    await fetch('/uploads', {
            method: 'POST',
            body: formData
        })
        .then(res => {
            if (res.status == 200){
                window.location.reload();
            }
        });
    });

    input.click();
}