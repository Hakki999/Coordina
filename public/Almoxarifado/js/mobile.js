const nextMobile = document.querySelector('.nextMobile');
let currentStep = 0;

function activeMaterials() {
    const materialsHeader = document.getElementsByClassName('materials-header')[0];
    materialsHeader.style.display = 'none';
    const materials = document.getElementsByClassName('materials')[0];
    materials.style.display = 'none';

    const listMaterials = document.getElementsByClassName('listMaterials')[0];
    listMaterials.setAttribute('style', 'display: block !important;');

    nextMobile.setAttribute('style', 'display: none !important;');

}


nextMobile.addEventListener('click', () => {
    currentStep++;
    // Lógica para avançar para a próxima etapa

    switch (currentStep) {
        case 1:
            activeMaterials();
            break;
        // Adicione mais casos conforme necessário
    }
});


