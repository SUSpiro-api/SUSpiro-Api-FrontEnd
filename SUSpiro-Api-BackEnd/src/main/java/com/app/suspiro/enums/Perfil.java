package com.app.suspiro.enums;

public enum Perfil {
    SUPER_ADMIN,     // 0 - acesso total ao sistema
    ADMIN,           // 1 - administra a unidade (só SUPER_ADMIN cria)
    MEDICO,          // 2 - profissional de saúde
    ENFERMEIRO,      // 3 - profissional de saúde
    RECEPCIONISTA,   // 4 - atendimento/recepção
    USUARIO          // 5 - perfil genérico (mantido por compatibilidade)
}