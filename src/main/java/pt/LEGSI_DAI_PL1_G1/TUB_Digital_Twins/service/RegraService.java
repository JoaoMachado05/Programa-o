package pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.domain.Regra;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.repository.RegraRepository;
import pt.LEGSI_DAI_PL1_G1.TUB_Digital_Twins.exception.RegraException;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class RegraService {

    private final RegraRepository regraRepository;

    @Autowired
    public RegraService(RegraRepository regraRepository) {
        this.regraRepository = regraRepository;
    }

    @Transactional
    public Regra adicionarRegra(Regra novaRegra) {
        if (novaRegra == null) {
            throw new RegraException("Regra não pode ser nula");
        }

        validarRegra(novaRegra);

        // Verificações de conflito com regras existentes (apenas para tipo e data)
        for (Regra regraExistente : regraRepository.findAll()) {
            if (Objects.equals(regraExistente.getTipo(), novaRegra.getTipo()) &&
                    Objects.equals(regraExistente.getData(), novaRegra.getData()) &&
                    !Objects.equals(regraExistente.getId(), novaRegra.getId())) {
                throw new RegraException("Regra contradiz a regra existente com ID: " + regraExistente.getId());
            }
        }

        return regraRepository.save(novaRegra);
    }

    @Transactional
    public String removerRegraPorId(Long id) {
        if (id == null) {
            throw new RegraException("ID não pode ser nulo");
        }

        Optional<Regra> regraOpt = regraRepository.findById(id);

        if (regraOpt.isEmpty()) {
            throw new RegraException("Regra com ID " + id + " não encontrada");
        }

        regraRepository.deleteById(id);
        return "Regra removida com sucesso!";
    }

    @Transactional
    public String editarRegra(Regra regraNova) {
        if (regraNova == null || regraNova.getId() == null) {
            throw new RegraException("Regra ou ID da regra não pode ser nulo");
        }

        Optional<Regra> regraOpt = regraRepository.findById(regraNova.getId());

        if (regraOpt.isEmpty()) {
            throw new RegraException("Regra com ID " + regraNova.getId() + " não encontrada");
        }

        validarRegra(regraNova);

        // Verificar conflitos com outras regras (excluindo a própria regra)
        for (Regra outraRegra : regraRepository.findAll()) {
            if (outraRegra.getId().equals(regraNova.getId())) {
                continue; // Ignorar a própria regra
            }

            if (Objects.equals(outraRegra.getTipo(), regraNova.getTipo()) &&
                    Objects.equals(outraRegra.getData(), regraNova.getData())) {
                throw new RegraException("Atualização contradiz a regra existente com ID: " + outraRegra.getId());
            }
        }

        // Atualiza a regra existente
        regraRepository.save(regraNova);
        return "Regra editada com sucesso!";
    }

    public List<Regra> listarRegras() {
        return regraRepository.findAll();
    }

    public Regra obterRegraPorId(Long id) {
        if (id == null) {
            throw new RegraException("ID não pode ser nulo");
        }

        return regraRepository.findById(id).orElse(null);
    }

    private void validarRegra(Regra regra) {
        if (regra.getTipo() == null || regra.getTipo().trim().isEmpty()) {
            throw new RegraException("Tipo da regra não pode ser nulo ou vazio");
        }

        if (regra.getData() == null) {
            throw new RegraException("Data da regra não pode ser nula");
        }

    }
}