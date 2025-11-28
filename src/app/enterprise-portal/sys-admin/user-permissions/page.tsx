'use client'

import React, { useState } from 'react'
import { Box, Text, Button, Input, FormControl, FormLabel, useToast, Checkbox, Select, useDisclosure, Modal, ModalBody, ModalHeader, ModalFooter, ModalContent, ModalOverlay, ModalCloseButton} from '@chakra-ui/react'
import { ToastStatus } from '@/types/handling'
import { FeaturePermission, Action, Scope, RoleWithID, initUserRoleWithID } from '@/types/company_users'
import { useRoles } from '@/context/UserRolesContext'
import { ADD_USER_ROLE, UPDATE_USER_ROLE, DELETE_USER_ROLE } from '@/lib/company_user_controller'

export default function Tickets(){
    const toast = useToast()
    const { data: allRoles } = useRoles()

    const [role_name, setRole] = useState<string>('')
    const [permissions, setPermissions] = useState<FeaturePermission[]>([])
    const [userRole, setUserRole] = useState<RoleWithID>(initUserRoleWithID)
    const [isLoading, setLoading] = useState<boolean>(false)

    const { isOpen: isOpenCreate, onOpen: onOpenCreate, onClose: onCloseCreate } = useDisclosure()
    const { isOpen: isOpenEdit, onOpen: onOpenEdit, onClose: onCloseEdit } = useDisclosure()
    const { isOpen: isOpenDelete, onOpen: onOpenDelete, onClose: onCloseDelete } = useDisclosure()

    const departments = [
        {
            dept_name: "Registration",
            features: ["Pending", "Registrations", "Batch Records", "Trainees", "Inquiries", "Analytics"]
        },
        {
            dept_name: "Training",
            features: ["Scheduling", "Training Tracker", "Batch Records", "Certification", "Instructors", "Analytics"]
        },
        {
            dept_name: "Inventory",
            features: ["Master List", "Categories", "Item Location", "Supplier", "Borrower's Log"]
        },
        {
            dept_name: "Marketing",
            features: ["Clients"]
        },
        {
            dept_name: "Accounting",
            features: ["Acknowledge"]
        },
        {
            dept_name: "Admin",
            features: ["Overview", "Employee", "Candidates", "Facilities", "Catalog"]
        },
        {
            dept_name: "R&D",
            features: ["Overview"]
        },
        {
            dept_name: "System Admin",
            features: ["Ticket Monitoring", "User Permissions", "Catalogs", "Tickets"]
        }
    ];

    const handleToast = (title: string = '', desc: string = '', timer: number, status: ToastStatus) => {
        toast({
            title: title,
            description: desc,
            position: 'top-right',
            variant: 'left-accent',
            status: status,
            duration: timer,
            isClosable: true,
        })
    }
    
    const handleDeleteRole = async (roleId: string) => {
        setLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    await DELETE_USER_ROLE(roleId)
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).then(() => {
            handleToast('Deleted Successfully!', `Please inform all affected users with the deleted role to wait for their new assigned roles.`, 5000, 'info')
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setLoading(false)
            onCloseDelete()
        })
    }

    const mergePermissions = () => {
        const base = [...userRole.permissions];

        permissions.forEach(update => {
            const index = base.findIndex(
                p => p.feature === update.feature && p.department === update.department
            );

            if (index >= 0) {
                base[index] = update;  // overwrite old permission
            } else {
                base.push(update);     // add newly edited permission
            }
        });

        return base;
    }

    const handleUpdateRole = async () => {
        try {
            setLoading(true);

            // 1. Merge into a final usable object
            const mergedPermissions = mergePermissions();

            const updatedRole = {
                role_name: role_name || userRole.role_name,
                permissions: mergedPermissions
            };

            // 2. Update Firestore (use updatedRole directly)
            await UPDATE_USER_ROLE(userRole.id, updatedRole);

            // 3. Update local state AFTER the Firestore update
            setUserRole(prev => ({
                ...prev,
                ...updatedRole
            }));

            // 4. Reset ONLY AFTER success
            setPermissions([]);
            setRole('');
            onCloseEdit();
            handleToast('Updated Successfully!', `The role and its permissions have been updated.`, 5000, 'success');
        } catch (error) {
            console.error("ERROR DETECTED: ", error);
        } finally {
            setLoading(false);
        }
    }

    const handleUserRole = async () => {
        setLoading(true)
        new Promise<void>((res, rej) => {
            setTimeout(async () => {
                try{
                    const mergeData = {
                        role_name: role_name,
                        permissions: permissions
                    }
                    await ADD_USER_ROLE(mergeData)
                    res()
                }catch(error){
                    rej(error)
                }
            }, 500)
        }).then(() => {
            handleToast('Created Successfully!', `You can now assign this role to users and manage their access more efficiently.`, 5000, 'success')
        }).catch((error) => {
            console.error("ERROR DETECTED: ", error)
        }).finally(() => {
            setLoading(false)
            setPermissions([])
            setRole('')
            onCloseCreate()
        })
    }

    const togglePermission = (department: string, feature: string, action: Action) => {
        setPermissions(prev => {
            const existing = prev.find(p => p.feature === feature && p.department === department);

            // If no existing permission for this feature, create a new one (include required department)
            if (!existing) {
                return [...prev, { department, feature, allowed: [action], scope: undefined }];
            }

            // Toggle the action
            const updatedAllowed = existing.allowed.includes(action) ? existing.allowed.filter(a => a !== action) : [...existing.allowed, action];

            // Update feature entry
            return prev.map(p =>
                p.feature === feature && p.department === department ? { ...p, allowed: updatedAllowed } : p
            );
        });
    }

    // toggle scoped permission (Dated | BD | Both) - single scope per feature
    const toggleScope = (department: string, feature: string, scope: Scope) => {
        setPermissions(prev => {
            const existing = prev.find(p => p.feature === feature && p.department === department)
            if (!existing) {
                return [...prev, { department, feature, allowed: [], scope }]
            }
            return prev.map(p => p.feature === feature && p.department === department ? { ...p, scope } : p)
        })
    }

    return(
    <>
        <Box>
            <Text color='blue.700' fontSize='2xl' fontWeight='750'>Feature/Module Permissions</Text>
            <Box p='4' display='flex' justifyContent='end' >
                <Button onClick={onOpenCreate} bgColor='blue.700' shadow='md' colorScheme='blue' size='sm'>Create Role</Button>
            </Box>
            <Box>
                <Box>User Roles</Box>
                <Box>
                    {/** Table Header */}
                    <Box display='flex' borderRadius='5px' p='2' textAlign='center' justifyContent='space-between' bgColor='blue.700' color='white' >
                        <Text w='400px' textAlign='center'>Role</Text>
                        <Text w='400px' textAlign='center'>Feature/Module</Text>
                        <Text w='150px' textAlign='center'>View/Access</Text>
                        <Text w='150px' textAlign='center'>Create/Add</Text>
                        <Text w='150px' textAlign='center'>Modify/Edit</Text>
                        <Text w='150px' textAlign='center'>Delete/Remove</Text>
                        <Text w='150px' textAlign='center'>Export/Print</Text>
                        <Text w='400px' textAlign='center'>Remarks/Special Notes</Text>
                        <Text w='400px' textAlign='center'>Action</Text>
                    </Box>
                    {/** Table Body */}
                    <Box>
                        {allRoles && allRoles.map((role) => (
                            <Box key={role.id} display='flex' borderBottom='1px solid #ddd' p='2' justifyContent='space-between' alignItems='center' >
                                <Text w='400px' textAlign='center' fontWeight='600'>{role.role_name}</Text>
                                <Box w='400px' >
                                    {role.permissions.map((perm, index) => (
                                        <Box key={index} mb='2'>
                                            <Text textAlign='start' display='flex' justifyContent={'space-between'}>
                                                <Text fontWeight='bold'>
                                                    {perm.feature} 
                                                </Text>
                                                <Text >
                                                    {`(${perm.department})`}
                                                </Text>
                                            </Text>
                                        </Box>
                                    ))}
                                </Box>
                                <Box w='150px' display='flex' flexDirection='column' gap='2'>
                                    {role.permissions.map((perm, index) => (
                                        <Text key={index} textAlign='center'>{perm.allowed.includes('read') ? '✔️' : '❌'}</Text>
                                    ))}
                                </Box>
                                <Box w='150px' display='flex' flexDirection='column' gap='2'>
                                    {role.permissions.map((perm, index) => (
                                        <Text key={index} textAlign='center'>{perm.allowed.includes('create') ? '✔️' : '❌'}</Text>
                                    ))}
                                </Box>
                                <Box w='150px' display='flex' flexDirection='column' gap='2'>
                                    {role.permissions.map((perm, index) => (
                                        <Text key={index} textAlign='center'>{perm.allowed.includes('update') ? '✔️' : '❌'}</Text>
                                    ))}
                                </Box>
                                <Box w='150px' display='flex' flexDirection='column' gap='2'>
                                    {role.permissions.map((perm, index) => (
                                        <Text key={index} textAlign='center'>{perm.allowed.includes('delete') ? '✔️' : '❌'}</Text>
                                    ))}
                                </Box>
                                <Box w='150px' display='flex' flexDirection='column' gap='2'>
                                    {role.permissions.map((perm, index) => (
                                        <Text key={index} textAlign='center'>{perm.allowed.includes('print') ? '✔️' : '❌'}</Text>
                                    ))}
                                </Box>
                                <Box w='400px' gap='2' display='flex' flexDirection='column'>
                                    {role.permissions.map((perm, index) => (
                                        <Text key={index} textAlign='center' textTransform='capitalize'>
                                            {`View: ${perm.scope === 'both' ? 'Both Dated & BD' : perm.scope} Records`}
                                        </Text>
                                    ))}
                                </Box>
                                <Box w='400px' display='flex' justifyContent='center'>
                                    <Box w='50%' display='flex' flexDir='column' gap='2'>
                                        <Button onClick={() => {setUserRole(role); setPermissions(role.permissions); setRole(role.role_name); onOpenEdit();}} colorScheme='blue' shadow='md' size='xs'>Edit</Button>
                                        <Button onClick={() => {setUserRole(role); onOpenDelete();}} colorScheme='red' shadow='md' size='xs'>Delete</Button>
                                    </Box>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Box>
        {/** Create */}
        <Modal isOpen={isOpenCreate} onClose={onCloseCreate} scrollBehavior='inside' size='xl'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Create Role & Set Permissions</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box display='flex' flexDirection='column' gap='4'>
                        <FormControl isRequired>
                            <FormLabel>Role Name</FormLabel>
                            <Input onChange={(e) => setRole(e.target.value)} value={role_name} type='text' shadow='md' />
                        </FormControl>
                        {/* PERMISSIONS SECTION */}
                        <Text fontWeight="bold" fontSize="lg">Feature Permissions</Text>
                        <Box border="1px solid #ddd" borderRadius="md" padding="4">
                        {departments.map((dept) => (
                            <Box key={dept.dept_name} mb="5" borderBottom="1px solid #ccc" pb="3">
                                <Text fontWeight="bold" fontSize="md" color="blue.700" mb="2">
                                    {dept.dept_name}
                                </Text>
                                {dept.features.map((feature) => {
                                    const featurePerm = permissions.find((p) => p.feature === feature && p.department === dept.dept_name);
                                    return (
                                        <Box key={feature} mb="3" pl="4">
                                            <Text fontWeight="semibold">{feature}</Text>
                                            {/* ACTION CHECKBOXES */}
                                            <Box display="flex" gap="4" mt="2" fontWeight='normal' textTransform="uppercase">
                                                {(["create", "read", "update", "delete", "print"] as Action[]).map(
                                                    (action) => (
                                                        <Checkbox
                                                            key={action}
                                                            isChecked={featurePerm?.allowed?.includes(action)}
                                                            onChange={() => togglePermission(dept.dept_name, feature, action)}
                                                        >
                                                            <Text fontSize="xs">{action}</Text>
                                                        </Checkbox>
                                                    )
                                                )}
                                            </Box>
                                            <Box display="flex" gap="4" mt="2" fontWeight='normal' textTransform="uppercase">
                                                {(["dated", "bd", "both"] as Scope[]).map(
                                                    (scope) => (
                                                        <Checkbox
                                                            colorScheme='green'
                                                            key={scope}
                                                            isChecked={featurePerm?.scope === scope}
                                                            onChange={() => toggleScope(dept.dept_name, feature, scope)}
                                                        >
                                                            <Text fontSize="xs">{scope}</Text>
                                                        </Checkbox>
                                                    )
                                                )}
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        ))}
                        </Box>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button isLoading={isLoading} onClick={() => {handleUserRole();}} shadow='md' bgColor='blue.700' colorScheme='blue' loadingText='Creating Role...'>Create</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/** Edit Modal */}
        <Modal isOpen={isOpenEdit} onClose={onCloseEdit} scrollBehavior='inside' size='xl'>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Edit Role & Permissions</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <Box display='flex' flexDirection='column' gap='4'>
                        <FormControl isRequired>
                            <FormLabel>Role Name</FormLabel>
                            <Input onChange={(e) => setRole(e.target.value)} value={role_name || userRole.role_name} type='text' shadow='md' />
                        </FormControl>
                        {/* PERMISSIONS SECTION */}
                        <Text fontWeight="bold" fontSize="lg">Feature Permissions</Text>
                        <Box border="1px solid #ddd" borderRadius="md" padding="4">
                        {departments.map((dept) => (
                            <Box key={dept.dept_name} mb="5" borderBottom="1px solid #ccc" pb="3">
                                <Text fontWeight="bold" fontSize="md" color="blue.700" mb="2">
                                    {dept.dept_name}
                                </Text>
                                {dept.features.map((feature) => {
                                    const featurePerm = permissions.length > 0
                                        ? permissions.find((p) => p.feature === feature && p.department === dept.dept_name)
                                        : userRole.permissions.find((p) => p.feature === feature && p.department === dept.dept_name);
                                    return (
                                        <Box key={feature} mb="3" pl="4">
                                            <Text fontWeight="semibold">{feature}</Text>
                                            {/* ACTION CHECKBOXES */}
                                            <Box display="flex" gap="4" mt="2" fontWeight='normal' textTransform="uppercase">
                                                {(["create", "read", "update", "delete", "print"] as Action[]).map(
                                                    (action) => (
                                                        <Checkbox
                                                            key={action}
                                                            isChecked={featurePerm?.allowed?.includes(action)}
                                                            onChange={() => togglePermission(dept.dept_name, feature, action)}
                                                        >
                                                            <Text fontSize="xs">{action}</Text>
                                                        </Checkbox>
                                                    )
                                                )}
                                            </Box>
                                            <Box display="flex" gap="4" mt="2" fontWeight='normal' textTransform="uppercase">
                                                {(["dated", "bd", "both"] as Scope[]).map(
                                                    (scope) => (
                                                        <Checkbox
                                                            colorScheme='green'
                                                            key={scope}
                                                            isChecked={featurePerm?.scope === scope}
                                                            onChange={() => toggleScope(dept.dept_name, feature, scope)}
                                                        >
                                                            <Text fontSize="xs">{scope}</Text>
                                                        </Checkbox>
                                                    )
                                                )}
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                        ))}
                        </Box>
                    </Box>
                </ModalBody>
                <ModalFooter>
                    <Button isLoading={isLoading} onClick={() => {handleUpdateRole();}} shadow='md' bgColor='blue.700' colorScheme='blue' loadingText='Updating Role...'>Update</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
        {/** Delete Modal */}
        <Modal isOpen={isOpenDelete} onClose={onCloseDelete} >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Delete this Role</ModalHeader>
                <ModalCloseButton />
                <ModalBody fontWeight='normal'>
                    <Text>Are you sure you want to delete this role?</Text>
                    <Text>The moment you delete it, Users with this role will won't have any permissions to the features set to it in the system.</Text>
                    <Text>Yet, they can be assigned with a different role.</Text>
                </ModalBody>
                <ModalFooter display={'flex'} justifyContent='center'>
                    <Button isLoading={isLoading} onClick={() => {handleDeleteRole(userRole.id);}} colorScheme='red' shadow='md' loadingText='Deleting Role...'>Yes, Delete it</Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    </>
    )
}