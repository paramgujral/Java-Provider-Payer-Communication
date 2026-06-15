package com.example.demo.health_care.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.health_care.dto.DiseaseDTO;
import com.example.demo.health_care.exception.exceptions.NotFoundException;
import com.example.demo.health_care.mapper.DiseaseMapper;
import com.example.demo.health_care.model.Disease;
import com.example.demo.health_care.repository.DiseaseRepository;
import com.example.demo.health_care.service.DiseaseService;

@Service
public class DiseaseServiceImpl implements DiseaseService {

    private final DiseaseRepository diseaseRepository;

    public DiseaseServiceImpl(DiseaseRepository diseaseRepository) {
        this.diseaseRepository = diseaseRepository;
    }

    @Override
    @Transactional
    public DiseaseDTO create(DiseaseDTO request) {
        Disease saved = diseaseRepository.save(DiseaseMapper.toEntity(request));
        return DiseaseMapper.toDto(saved);
    }

    @Override
    @Transactional
    public DiseaseDTO update(UUID id, DiseaseDTO request) {
        Disease existing = diseaseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Disease not found for id=" + id));

        existing.setDiseaseCode(request.getDiseaseCode());
        existing.setDiseaseName(request.getDiseaseName());
        existing.setDescription(request.getDescription());

        Disease saved = diseaseRepository.save(existing);
        return DiseaseMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public DiseaseDTO getById(UUID id) {
        Disease existing = diseaseRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Disease not found for id=" + id));
        return DiseaseMapper.toDto(existing);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DiseaseDTO> listAll() {
        return diseaseRepository.findAll().stream().map(DiseaseMapper::toDto).toList();
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!diseaseRepository.existsById(id)) {
            throw new NotFoundException("Disease not found for id=" + id);
        }
        diseaseRepository.deleteById(id);
    }
}

