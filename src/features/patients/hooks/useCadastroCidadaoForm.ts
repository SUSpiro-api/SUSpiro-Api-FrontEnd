import { useState, type FormEvent } from 'react';
import { ApiError } from '../../../api/httpClient';
import { formatCpf } from '../../../utils/cpf';
import { useFocusFirstInvalidField } from '../../../hooks/useFocusFirstInvalidField';
import { cadastrarPaciente, type PacienteCriado } from '../service';
import {
  validateCpfPaciente,
  validateDataNascimento,
  validateNomePaciente,
  validateConvenio,
  validateEmailPaciente,
  validateTelefone,
} from '../validation';

type Campo = 'nome' | 'cpf' | 'dataNascimento' | 'convenio' | 'telefone' | 'email';
type ErrosDoFormulario = Partial<Record<Campo, string>>;

export function useCadastroCidadaoForm(onSucesso: (paciente: PacienteCriado) => void) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [convenio, setConvenio] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [fieldErrors, setFieldErrors] = useState<ErrosDoFormulario>({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { formRef, focusFirstInvalidField } = useFocusFirstInvalidField();

  function clearError(campo: Campo) {
    setFieldErrors((erros) => ({ ...erros, [campo]: undefined }));
  }

  function alterarNome(valor: string) {
    setNome(valor);
    clearError('nome');
  }

  function alterarCpf(valor: string) {
    setCpf(formatCpf(valor));
    clearError('cpf');
  }

  function alterarDataNascimento(valor: string) {
    setDataNascimento(valor);
    clearError('dataNascimento');
  }

  function alterarConvenio(valor: string) {
    setConvenio(valor.slice(0, 120));
    clearError('convenio');
  }

  function alterarTelefone(valor: string) {
    setTelefone(valor);
    clearError('telefone');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const errors: ErrosDoFormulario = {
      nome: validateNomePaciente(nome),
      cpf: validateCpfPaciente(cpf),
      dataNascimento: validateDataNascimento(dataNascimento),
      convenio: validateConvenio(convenio),
      telefone: validateTelefone(telefone),
      email: validateEmailPaciente(email),
    };
    const validErrors = Object.fromEntries(
      Object.entries(errors).filter(([, message]) => message),
    ) as ErrosDoFormulario;

    setFieldErrors(validErrors);
    setFormError('');

    if (Object.keys(validErrors).length > 0) {
      focusFirstInvalidField();
      return;
    }

    setIsSubmitting(true);

    try {
      const paciente = await cadastrarPaciente({
        nome,
        cpf,
        dataNascimento,
        convenio,
        telefone,
        email,
      });
      onSucesso(paciente);
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível cadastrar o cidadão. Tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    nome,
    cpf,
    dataNascimento,
    convenio,
    telefone,
    email,
    fieldErrors,
    formError,
    isSubmitting,
    formRef,
    handleSubmit,
    alterarNome,
    alterarCpf,
    alterarDataNascimento,
    alterarConvenio,
    alterarTelefone,
    alterarEmail: (valor: string) => { setEmail(valor); clearError('email'); },
  };
}
