package com.app.suspiro.config;

import com.app.suspiro.enums.Perfil;
import com.app.suspiro.model.UsuariosModel;
import com.app.suspiro.repository.UsuariosRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminRoot implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminRoot.class);

    private final UsuariosRepository usuariosRepository;
    private final PasswordEncoder passwordEncoder;
    private final String cpf;
    private final String nome;
    private final String senha;

    public AdminRoot(
            UsuariosRepository usuariosRepository,
            PasswordEncoder passwordEncoder,
            @Value("${SUPER_ADMIN_CPF:}") String cpf,
            @Value("${SUPER_ADMIN_NOME:}") String nome,
            @Value("${SUPER_ADMIN_PASSWORD:}") String senha) {
        this.usuariosRepository = usuariosRepository;
        this.passwordEncoder = passwordEncoder;
        this.cpf = cpf;
        this.nome = nome;
        this.senha = senha;
    }

    @Override
    public void run(String... args) {
        if (usuariosRepository.existsByPerfil(Perfil.SUPER_ADMIN)) {
            log.info("SUPER_ADMIN já existe; bootstrap ignorado.");
            return;
        }

        if (cpf.isBlank() || nome.isBlank() || senha.isBlank()) {
            throw new IllegalStateException(
                    "SUPER_ADMIN_CPF, SUPER_ADMIN_NOME e SUPER_ADMIN_PASSWORD são obrigatórios para o bootstrap inicial.");
        }

        UsuariosModel superAdmin = new UsuariosModel();
        superAdmin.setCpf(cpf.replaceAll("\\D", ""));
        superAdmin.setNome(nome.trim());
        superAdmin.setSenha(passwordEncoder.encode(senha));
        superAdmin.setPerfil(Perfil.SUPER_ADMIN);
        superAdmin.setAtivo(true);

        usuariosRepository.save(superAdmin);
        log.info("SUPER_ADMIN criado com sucesso.");
    }
}
