package com.shms.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.shms.model.Doctor;
import com.shms.model.MedicalRecord;
import com.shms.model.Patient;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
    List<MedicalRecord> findByPatient(Patient patient);
    
    List<MedicalRecord> findByDoctor(Doctor doctor);
} 