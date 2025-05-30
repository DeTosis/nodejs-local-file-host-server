window.addEventListener('load', () => {
    const div = document.createElement('div');
    const img = document.createElement('img');
    img.src = '../img/download.png';
    img.className = 'download-img';
    div.className = 'img-container';

    img.onclick = () =>  uploadFile();

    const footer = document.getElementById('footer');
    div.append(img);
    footer.append(div);
});

function uploadFile(){
    let input = document.getElementById('hiddenFileInput');
    input.value = '';

    input.type = 'file';
    input.multiple = true;

    input.onchange = async function(){
        const files = input.files;
        const formData = new FormData();

        for (let i = 0; i < files.length; i++){
            formData.append('files[]', files[i],files[i].webkitRelativePath || files[i].name);
        }
        await fetch('/uploads', {
                method: 'POST',
                body: formData
            }).then(async(res) => {
                if (res.status == 200){
                    await reloadPage();
                }
            });
        input.onchange = null;
    };
    input.click();
}