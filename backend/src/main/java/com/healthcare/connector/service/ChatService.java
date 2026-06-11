package com.healthcare.connector.service;

import com.healthcare.connector.dto.MessageDto;
import com.healthcare.connector.entity.Message;
import com.healthcare.connector.entity.User;
import com.healthcare.connector.mapper.MessageMapper;
import com.healthcare.connector.repository.MessageRepository;
import com.healthcare.connector.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final MessageMapper messageMapper;

    public ChatService(MessageRepository messageRepository, UserRepository userRepository, MessageMapper messageMapper) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.messageMapper = messageMapper;
    }

    public List<MessageDto> getMessagesByRequestId(Long requestId) {
        List<Message> messages = messageRepository.findByRequestIdOrderByCreatedDateAsc(requestId);
        return messages.stream().map(message -> {
            MessageDto dto = messageMapper.toDto(message);
            userRepository.findById(message.getSenderId()).ifPresent(user -> dto.setSender(user.getFullName()));
            userRepository.findById(message.getReceiverId()).ifPresent(user -> dto.setReceiver(user.getFullName()));
            return dto;
        }).collect(Collectors.toList());
    }

    public MessageDto sendMessage(Long requestId, MessageDto messageDto) {
        Message message = messageMapper.toEntity(messageDto);
        message.setRequestId(requestId);
        
        // Set sender and receiver IDs based on current user and request context
        // This part needs actual implementation based on security context
        // For now, using dummy values or assuming they are in messageDto
        
        Message savedMessage = messageRepository.save(message);
        MessageDto savedMessageDto = messageMapper.toDto(savedMessage);
        userRepository.findById(savedMessage.getSenderId()).ifPresent(user -> savedMessageDto.setSender(user.getFullName()));
        userRepository.findById(savedMessage.getReceiverId()).ifPresent(user -> savedMessageDto.setReceiver(user.getFullName()));
        return savedMessageDto;
    }
}
