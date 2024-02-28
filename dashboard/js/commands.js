var commandType = document.querySelectorAll('.command-type');

commandType.forEach(type => {
    type.addEventListener('click', () => {
        commandType.forEach(x => x.classList.remove('selected'));
        type.classList.add('selected');

        let allCommands = document.querySelectorAll('.command');

        let commands = document.querySelectorAll(`.${type.id}`);
        if (type.id === 'all') commands = document.querySelectorAll(`.command`);

        allCommands.forEach(x => { 
            x.style.position = 'absolute';
            x.style.opacity = '0';
        });
        commands.forEach(x => { 
            x.style.position = 'relative';
            x.style.opacity = '1';
        });
    });
});