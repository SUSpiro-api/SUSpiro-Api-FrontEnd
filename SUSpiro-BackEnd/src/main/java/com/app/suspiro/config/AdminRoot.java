package com.app.suspiro.config;

import com.app.suspiro.enums.Perfil;
import com.app.suspiro.model.UsuariosModel;
import com.app.suspiro.repository.UsuariosRepository;
import com.app.suspiro.util.CpfUtils;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminRoot implements CommandLineRunner {

    private final UsuariosRepository usuariosRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminRoot(
            UsuariosRepository usuariosRepository,
            PasswordEncoder passwordEncoder) {

        this.usuariosRepository = usuariosRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        System.out.println("=================================");
        System.out.println("ADMIN ROOT INICIADO");
        System.out.println("=================================");

        boolean existe =
                usuariosRepository.existsByPerfil(Perfil.SUPER_ADMIN);

        System.out.println("SUPER_ADMIN EXISTE? " + existe);

        if (existe) {
            System.out.println("Super Admin já existe.");
            return;
        }

        System.out.println("Super Admin ainda não existe.");
        System.out.println("Lendo configurações do ambiente...");

        String cpf = CpfUtils.normalize(getEnvironmentValue("SUPER_ADMIN_CPF"));
        String nome = getEnvironmentValue("SUPER_ADMIN_NOME");
        String senha = getEnvironmentValue("SUPER_ADMIN_PASSWORD");

        System.out.println("CPF encontrado? " + (cpf != null));
        System.out.println("NOME encontrado? " + (nome != null));
        System.out.println("SENHA encontrada? " + (senha != null));

        if (cpf == null || cpf.length() != 11 || nome == null || senha == null) {
            throw new IllegalStateException(
                    "SUPER_ADMIN_CPF deve conter 11 dígitos, com ou sem formatação, e SUPER_ADMIN_NOME/SUPER_ADMIN_PASSWORD devem estar definidos."
            );
        }

        UsuariosModel superAdmin = new UsuariosModel();

        superAdmin.setCpf(cpf);
        superAdmin.setNome(nome);
        superAdmin.setSenha(passwordEncoder.encode(senha));
        superAdmin.setPerfil(Perfil.SUPER_ADMIN);
        superAdmin.setAtivo(true);

        usuariosRepository.save(superAdmin);

        System.out.println("=================================");
        System.out.println("SUPER ADMIN CRIADO COM SUCESSO!");
        System.out.println("NOME: " + nome);
        System.out.println("=================================");
    }

    private String getEnvironmentValue(String key) {
        String systemProperty = System.getProperty(key);
        if (systemProperty != null && !systemProperty.isBlank()) {
            return systemProperty.trim();
        }

        String environmentVariable = System.getenv(key);
        if (environmentVariable != null && !environmentVariable.isBlank()) {
            return environmentVariable.trim();
        }

        return null;
    }
}