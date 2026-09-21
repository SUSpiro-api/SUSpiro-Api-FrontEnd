ALTER TABLE usuarios
    DROP CONSTRAINT chk_usuarios_perfil;

ALTER TABLE usuarios
    ADD CONSTRAINT chk_usuarios_perfil
        CHECK (perfil IN (
            'SUPER_ADMIN',
            'ADMIN',
            'MEDICO',
            'ENFERMEIRO',
            'RECEPCIONISTA',
            'USUARIO'
        ));
